"use server";

import { z } from "zod";
import { createClient as createServerSupabase, isSupabaseConfigured } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { CTFEvent, PublicQuestion, Question, Submission, getEventStatus } from "./types";
import { INITIAL_MOCK_EVENTS, INITIAL_MOCK_QUESTIONS, INITIAL_MOCK_SUBMISSIONS, DEMO_HOST, DEMO_USER } from "./mock-data";

import { CreateEventSchema, QuestionSchema, EventFormValues } from "./validations";

function ensureUtcIso(timeStr: string, offsetMinutes?: number): string {
  // If already has ISO timezone indicator like 'Z' or '+05:30' or '-04:00'
  if (timeStr.includes("Z") || timeStr.includes("+") || /T\d{2}:\d{2}(:\d{2})?-\d{2}:\d{2}/.test(timeStr)) {
    return new Date(timeStr).toISOString();
  }

  // If local time without timezone was passed (e.g. "2026-10-14T22:45" from datetime-local input)
  if (typeof offsetMinutes === "number" && !isNaN(offsetMinutes)) {
    const [dPart, tPart] = timeStr.split("T");
    if (dPart && tPart) {
      const [y, m, d] = dPart.split("-").map(Number);
      const [hh, mm] = tPart.split(":").map(Number);
      const fakeUtcMs = Date.UTC(y, m - 1, d, hh, mm, 0);
      const realUtcMs = fakeUtcMs + offsetMinutes * 60 * 1000;
      return new Date(realUtcMs).toISOString();
    }
  }

  return new Date(timeStr).toISOString();
}

// ==============================================================================
// Server Action: Create Event
// ==============================================================================
export async function createEventAction(formData: z.infer<typeof CreateEventSchema>) {
  const validated = CreateEventSchema.safeParse(formData);
  if (!validated.success) {
    return {
      success: false,
      error: validated.error.issues[0]?.message || "Validation failed",
    };
  }

  const { title, pin_code, start_time, end_time, timezone_offset, questions } = validated.data;
  const finalStartTime = ensureUtcIso(start_time, timezone_offset);
  const finalEndTime = ensureUtcIso(end_time, timezone_offset);

  if (!isSupabaseConfigured()) {
    // Demo Mode: Mock create
    const newEventId = `event-custom-${Date.now()}`;
    const newEvent: CTFEvent = {
      id: newEventId,
      title,
      pin_code,
      host_id: DEMO_USER.id,
      start_time: finalStartTime,
      end_time: finalEndTime,
      created_at: new Date().toISOString(),
      host: DEMO_USER,
      _count: {
        questions: questions.length,
        submissions: 0,
      },
    };

    const newQuestions: Question[] = questions.map((q, idx) => ({
      id: `q-${newEventId}-${idx}`,
      event_id: newEventId,
      prompt: q.prompt,
      media_url: q.media_url || null,
      correct_answer: q.correct_answer,
      points: q.points,
      order_index: idx,
    }));

    INITIAL_MOCK_EVENTS.unshift(newEvent);
    INITIAL_MOCK_QUESTIONS[newEventId] = newQuestions;
    INITIAL_MOCK_SUBMISSIONS[newEventId] = [];

    return {
      success: true,
      eventId: newEventId,
      pinCode: pin_code,
    };
  }

  // Supabase Mode
  const supabase = await createServerSupabase();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, error: "Authentication required to host an event." };
  }

  // Check pin code uniqueness
  const { data: existingPin } = await supabase
    .from("events")
    .select("id")
    .eq("pin_code", pin_code)
    .maybeSingle();

  if (existingPin) {
    return { success: false, error: "This PIN code is already taken. Please choose another or generate one." };
  }

  // 1. Insert Event
  const { data: event, error: eventError } = await supabase
    .from("events")
    .insert({
      title,
      pin_code,
      host_id: user.id,
      start_time: finalStartTime,
      end_time: finalEndTime,
    })
    .select()
    .single();

  if (eventError || !event) {
    return { success: false, error: eventError?.message || "Failed to create event." };
  }

  // 2. Insert Questions
  const questionsToInsert = questions.map((q, idx) => ({
    event_id: event.id,
    prompt: q.prompt,
    media_url: q.media_url || null,
    correct_answer: q.correct_answer,
    points: q.points,
    order_index: idx,
  }));

  const { error: questionsError } = await supabase
    .from("questions")
    .insert(questionsToInsert);

  if (questionsError) {
    return { success: false, error: questionsError.message };
  }

  return {
    success: true,
    eventId: event.id,
    pinCode: event.pin_code,
  };
}

// ==============================================================================
// Server Action: Join / Find Event by PIN
// ==============================================================================
export async function findEventByPinAction(pin: string) {
  const cleanPin = pin.trim();
  if (!cleanPin) {
    return { success: false, error: "Please enter a PIN code." };
  }

  if (!isSupabaseConfigured()) {
    const mock = INITIAL_MOCK_EVENTS.find(
      (e) => e.pin_code.toLowerCase() === cleanPin.toLowerCase()
    );
    if (!mock) {
      return { success: false, error: "No CTF found matching this PIN code." };
    }
    return {
      success: true,
      event: {
        id: mock.id,
        title: mock.title,
        pin_code: mock.pin_code,
        start_time: mock.start_time,
        end_time: mock.end_time,
      },
    };
  }

  const supabase = await createServerSupabase();
  const { data: event, error } = await supabase
    .from("events")
    .select("id, title, pin_code, start_time, end_time")
    .eq("pin_code", cleanPin)
    .maybeSingle();

  if (error || !event) {
    return { success: false, error: "No CTF found matching this PIN code. Verify with the host." };
  }

  return { success: true, event };
}

// ==============================================================================
// Server Action: Submit Flag (SECURE, ZERO LEAKS)
// Flag verification happens exclusively here on the server
// ==============================================================================
export async function submitFlagAction({
  eventId,
  questionId,
  submittedAnswer,
  clientUserId,
}: {
  eventId: string;
  questionId: string;
  submittedAnswer: string;
  clientUserId?: string;
}) {
  const cleanAnswer = submittedAnswer.trim();
  if (!cleanAnswer) {
    return { success: false, error: "Please provide an answer before submitting." };
  }

  if (!isSupabaseConfigured()) {
    // Mock Mode
    const event = INITIAL_MOCK_EVENTS.find((e) => e.id === eventId);
    if (!event) return { success: false, error: "Event not found." };

    const status = getEventStatus(event.start_time, event.end_time);
    if (status === "upcoming") {
      return { success: false, error: "Event has not started yet." };
    }
    if (status === "ended") {
      return { success: false, error: "Event has ended. Submissions are closed." };
    }

    const questions = INITIAL_MOCK_QUESTIONS[eventId] || [];
    const question = questions.find((q) => q.id === questionId);
    if (!question) return { success: false, error: "Question not found." };

    const userId = clientUserId || DEMO_USER.id;
    const eventSubmissions = INITIAL_MOCK_SUBMISSIONS[eventId] || [];

    // Check if already solved
    const alreadySolved = eventSubmissions.some(
      (s) => s.user_id === userId && s.question_id === questionId && s.is_correct
    );

    if (alreadySolved) {
      return {
        success: true,
        is_correct: true,
        already_solved: true,
        points_awarded: 0,
        message: "You have already captured this flag!",
      };
    }

    const is_correct = Boolean(
      question.correct_answer && cleanAnswer === question.correct_answer.trim()
    );
    const points_awarded = is_correct ? question.points : 0;

    const newSub: Submission = {
      id: `sub-${Date.now()}`,
      event_id: eventId,
      question_id: questionId,
      user_id: userId,
      submitted_answer: cleanAnswer,
      is_correct,
      points_awarded,
      created_at: new Date().toISOString(),
      profiles: { id: userId, username: DEMO_USER.username, created_at: "" },
    };

    if (!INITIAL_MOCK_SUBMISSIONS[eventId]) {
      INITIAL_MOCK_SUBMISSIONS[eventId] = [];
    }
    INITIAL_MOCK_SUBMISSIONS[eventId].unshift(newSub);

    return {
      success: true,
      is_correct,
      points_awarded,
      already_solved: false,
      message: is_correct
        ? `Flag captured! +${points_awarded} points awarded.`
        : "Incorrect flag. Check formatting and try again.",
    };
  }

  // Supabase Mode
  const supabase = await createServerSupabase();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, error: "Authentication required to submit." };
  }

  // 1. Time-Gated check on event
  const { data: event, error: eventErr } = await supabase
    .from("events")
    .select("id, start_time, end_time")
    .eq("id", eventId)
    .single();

  if (eventErr || !event) {
    return { success: false, error: "Event not found." };
  }

  const now = new Date();
  if (now < new Date(event.start_time)) {
    return { success: false, error: "Event has not started yet." };
  }
  if (now > new Date(event.end_time)) {
    return { success: false, error: "Event has ended. Submissions are closed." };
  }

  // 2. Fetch Question Secret using Admin / Server client
  const adminSupabase = createAdminClient();
  const { data: question, error: qErr } = await adminSupabase
    .from("questions")
    .select("id, correct_answer, points")
    .eq("id", questionId)
    .eq("event_id", eventId)
    .single();

  if (qErr || !question) {
    return { success: false, error: "Question not found." };
  }

  // 3. Check duplicate correct solve
  const { data: existingSolve } = await supabase
    .from("submissions")
    .select("id")
    .eq("user_id", user.id)
    .eq("question_id", questionId)
    .eq("is_correct", true)
    .maybeSingle();

  if (existingSolve) {
    return {
      success: true,
      is_correct: true,
      already_solved: true,
      points_awarded: 0,
      message: "You have already captured this flag!",
    };
  }

  // 4. Verification (Exact Match Check)
  const is_correct = Boolean(
    question.correct_answer && cleanAnswer === question.correct_answer.trim()
  );
  const points_awarded = is_correct ? question.points : 0;

  // 5. Insert submission
  const { error: subErr } = await supabase.from("submissions").insert({
    event_id: eventId,
    question_id: questionId,
    user_id: user.id,
    submitted_answer: cleanAnswer,
    is_correct,
    points_awarded,
  });

  if (subErr) {
    return { success: false, error: subErr.message };
  }

  return {
    success: true,
    is_correct,
    points_awarded,
    already_solved: false,
    message: is_correct
      ? `Flag captured! +${points_awarded} points awarded.`
      : "Incorrect flag. Check formatting and try again.",
  };
}

// ==============================================================================
// Server Action: Get Event Questionnaire (Sanitized, NO correct_answer)
// ==============================================================================
export async function getEventQuestionnaireAction(eventId: string) {
  if (!isSupabaseConfigured()) {
    const event = INITIAL_MOCK_EVENTS.find((e) => e.id === eventId);
    if (!event) return { success: false, error: "Event not found" };

    const questions = INITIAL_MOCK_QUESTIONS[eventId] || [];
    // Sanitize: strip correct_answer
    const sanitizedQuestions: PublicQuestion[] = questions.map(
      ({ correct_answer, ...rest }) => rest
    );

    return {
      success: true,
      event,
      questions: sanitizedQuestions,
    };
  }

  const supabase = await createServerSupabase();
  const { data: event, error: eventErr } = await supabase
    .from("events")
    .select("*, host:profiles(username)")
    .eq("id", eventId)
    .single();

  if (eventErr || !event) {
    return { success: false, error: "Event not found" };
  }

  // Fetch only sanitized fields
  const { data: questions, error: qErr } = await supabase
    .from("questions")
    .select("id, event_id, prompt, media_url, points, order_index")
    .eq("event_id", eventId)
    .order("order_index", { ascending: true });

  if (qErr) {
    return { success: false, error: qErr.message };
  }

  return {
    success: true,
    event,
    questions: questions as PublicQuestion[],
  };
}
