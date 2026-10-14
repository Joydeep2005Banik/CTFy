"use client";

import { useEffect, useState, Suspense } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  Clock,
  Calendar,
  AlertCircle,
  CheckCircle2,
  Trophy,
  ExternalLink,
  Flag,
  Send,
  Sparkles,
  Lock,
  ArrowRight,
  Shield,
  HelpCircle,
  ImageIcon,
  KeyRound,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CTFEvent, PublicQuestion, getEventStatus } from "@/lib/types";
import { getEventQuestionnaireAction, submitFlagAction, findEventByPinAction } from "@/lib/actions";
import { createClient, isSupabaseConfigured } from "@/lib/supabase/client";
import { DEMO_USER } from "@/lib/mock-data";
import { formatDate, formatTimeRemaining, isEventUnlocked, markEventUnlocked } from "@/lib/utils";
import confetti from "canvas-confetti";

function PlayArenaContent() {
  const params = useParams();
  const eventId = params.id as string;
  const router = useRouter();

  const [event, setEvent] = useState<CTFEvent | null>(null);
  const [questions, setQuestions] = useState<PublicQuestion[]>([]);
  const [user, setUser] = useState<{ id: string; username: string } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // PIN gate state
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [gatePin, setGatePin] = useState("");
  const [gateError, setGateError] = useState<string | null>(null);
  const [unlocking, setUnlocking] = useState(false);

  // Solved state tracking for current user: questionId -> boolean
  const [solvedMap, setSolvedMap] = useState<Record<string, boolean>>({});
  // Form submission input values: questionId -> text
  const [inputs, setInputs] = useState<Record<string, string>>({});
  // Submission feedback: questionId -> { status: "correct" | "incorrect", message: string }
  const [feedbacks, setFeedbacks] = useState<
    Record<string, { status: "correct" | "incorrect" | "already_solved"; message: string }>
  >({});
  // Submitting state: questionId -> boolean
  const [submittingMap, setSubmittingMap] = useState<Record<string, boolean>>({});

  // Countdown timer clock
  const [timeRemaining, setTimeRemaining] = useState<number>(0);
  const [timeUntilStart, setTimeUntilStart] = useState<number>(0);
  const [userTotalPoints, setUserTotalPoints] = useState<number>(0);

  // Load Event and Questions
  useEffect(() => {
    if (!eventId) return;

    async function init() {
      // Reset inputs & feedback to guarantee clean state per user
      setInputs({});
      setFeedbacks({});
      setSolvedMap({});
      setUserTotalPoints(0);

      // 1. Resolve user
      let currentUserId = DEMO_USER.id;
      let currentUsername = DEMO_USER.username;

      if (!isSupabaseConfigured()) {
        const stored = localStorage.getItem("ctfy_demo_user");
        if (stored) {
          try {
            const parsed = JSON.parse(stored);
            currentUserId = parsed.id;
            currentUsername = parsed.username;
          } catch {}
        }
        setUser({ id: currentUserId, username: currentUsername });
      } else {
        const supabase = createClient();
        const {
          data: { session },
        } = await supabase.auth.getSession();

        if (session?.user) {
          currentUserId = session.user.id;
          const { data: prof } = await supabase
            .from("profiles")
            .select("username")
            .eq("id", session.user.id)
            .single();

          currentUsername = prof?.username || session.user.email?.split("@")[0] || "player";
          setUser({ id: currentUserId, username: currentUsername });
        } else {
          // Unauthenticated participant, allow demo ID or redirect
          setUser({ id: "anon-player", username: "Guest Hacker" });
        }
      }

      // 2. Fetch Event & Sanitized Questions
      const res = await getEventQuestionnaireAction(eventId);
      if (!res.success || !res.event) {
        setError(res.error || "Event not found");
        setLoading(false);
        return;
      }

      setEvent(res.event);
      setQuestions(res.questions || []);

      const isHost = res.event.host_id === currentUserId;
      const alreadyUnlocked = isEventUnlocked(eventId);
      let hasPastSubs = false;

      // 3. Fetch past submissions of this user to restore solved questions
      if (isSupabaseConfigured()) {
        const supabase = createClient();
        const { data: pastSubs } = await supabase
          .from("submissions")
          .select("question_id, is_correct, points_awarded")
          .eq("event_id", eventId)
          .eq("user_id", currentUserId)
          .eq("is_correct", true);

        if (pastSubs && pastSubs.length > 0) {
          hasPastSubs = true;
          const map: Record<string, boolean> = {};
          let total = 0;
          pastSubs.forEach((s) => {
            map[s.question_id] = true;
            total += s.points_awarded;
          });
          setSolvedMap(map);
          setUserTotalPoints(total);
        }
      } else {
        // Fallback demo local checks
        const savedSolves = localStorage.getItem(`ctfy_solves_${eventId}_${currentUserId}`);
        if (savedSolves) {
          try {
            const parsed = JSON.parse(savedSolves);
            setSolvedMap(parsed.map || {});
            setUserTotalPoints(parsed.points || 0);
            if (Object.keys(parsed.map || {}).length > 0) hasPastSubs = true;
          } catch {}
        }
      }

      setIsUnlocked(isHost || alreadyUnlocked || hasPastSubs);
      setLoading(false);
    }

    init();
  }, [eventId]);

  const handleUnlockPin = async () => {
    const clean = gatePin.trim();
    if (!clean) return;
    setUnlocking(true);
    setGateError(null);

    try {
      if (event && clean.toUpperCase() === event.pin_code.trim().toUpperCase()) {
        markEventUnlocked(eventId);
        setIsUnlocked(true);
        setUnlocking(false);
        return;
      }

      const res = await findEventByPinAction(clean);
      if (res.success && res.event && res.event.id === eventId) {
        markEventUnlocked(eventId);
        setIsUnlocked(true);
      } else {
        setGateError("Incorrect competition PIN code. Please verify with the event host.");
      }
    } catch {
      setGateError("Failed to verify PIN code. Please try again.");
    }
    setUnlocking(false);
  };

  // Tick timer for countdowns
  useEffect(() => {
    if (!event) return;

    const interval = setInterval(() => {
      const now = Date.now();
      const start = new Date(event.start_time).getTime();
      const end = new Date(event.end_time).getTime();

      setTimeUntilStart(Math.max(0, start - now));
      setTimeRemaining(Math.max(0, end - now));
    }, 1000);

    return () => clearInterval(interval);
  }, [event]);

  // Handle single question flag submission
  const handleAnswerSubmit = async (questionId: string) => {
    const answer = inputs[questionId]?.trim();
    if (!answer) return;

    setSubmittingMap((prev) => ({ ...prev, [questionId]: true }));

    try {
      const result = await submitFlagAction({
        eventId,
        questionId,
        submittedAnswer: answer,
        clientUserId: user?.id,
      });

      if (!result.success) {
        setFeedbacks((prev) => ({
          ...prev,
          [questionId]: {
            status: "incorrect",
            message: result.error || "Submission failed.",
          },
        }));
        setSubmittingMap((prev) => ({ ...prev, [questionId]: false }));
        return;
      }

      if (result.already_solved) {
        setFeedbacks((prev) => ({
          ...prev,
          [questionId]: {
            status: "already_solved",
            message: "Flag already captured!",
          },
        }));
        setSolvedMap((prev) => ({ ...prev, [questionId]: true }));
        setInputs((prev) => ({ ...prev, [questionId]: "" }));
      } else if (result.is_correct) {
        // Trigger celebratory confetti!
        try {
          confetti({
            particleCount: 60,
            spread: 70,
            origin: { y: 0.7 },
          });
        } catch {}

        setSolvedMap((prev) => {
          const updated = { ...prev, [questionId]: true };
          if (!isSupabaseConfigured()) {
            localStorage.setItem(
              `ctfy_solves_${eventId}_${user?.id || DEMO_USER.id}`,
              JSON.stringify({
                map: updated,
                points: userTotalPoints + (result.points_awarded || 0),
              })
            );
          }
          return updated;
        });

        // Clear input for this question immediately
        setInputs((prev) => ({ ...prev, [questionId]: "" }));
        setUserTotalPoints((prev) => prev + (result.points_awarded || 0));
        setFeedbacks((prev) => ({
          ...prev,
          [questionId]: {
            status: "correct",
            message: result.message || "Flag captured! Points awarded.",
          },
        }));
      } else {
        setFeedbacks((prev) => ({
          ...prev,
          [questionId]: {
            status: "incorrect",
            message: result.message || "Incorrect flag. Try again!",
          },
        }));
      }
    } catch (err: unknown) {
      setFeedbacks((prev) => ({
        ...prev,
        [questionId]: {
          status: "incorrect",
          message: err instanceof Error ? err.message : "Submission error",
        },
      }));
    } finally {
      setSubmittingMap((prev) => ({ ...prev, [questionId]: false }));
    }
  };

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center p-8 cyber-grid font-mono text-zinc-500">
        Authenticating & loading challenge arena...
      </div>
    );
  }

  if (error || !event) {
    return (
      <div className="flex-1 flex items-center justify-center p-8 cyber-grid">
        <Card className="max-w-md w-full border-zinc-800 text-center py-8">
          <CardContent className="space-y-4">
            <AlertCircle className="h-10 w-10 text-red-500 mx-auto" />
            <h2 className="text-xl font-bold text-white">Event Unavailable</h2>
            <p className="text-xs text-zinc-400">{error || "Event not found"}</p>
            <Link href="/join">
              <Button size="sm" className="bg-white text-black font-semibold">
                Try Another PIN
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  // ==============================================================================
  // 0. PIN GATE: REQUIRE VALID PIN CODE TO ENTER ARENA
  // ==============================================================================
  if (!isUnlocked) {
    return (
      <div className="flex-1 flex items-center justify-center p-4 cyber-grid min-h-[70vh]">
        <Card className="max-w-md w-full border-zinc-800 bg-zinc-950/90 backdrop-blur-md shadow-2xl text-center">
          <CardHeader className="space-y-2 pb-2">
            <div className="inline-flex items-center justify-center h-12 w-12 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-400 mx-auto">
              <KeyRound className="h-6 w-6 text-emerald-400" />
            </div>
            <Badge variant="outline" className="mx-auto text-xs font-mono border-zinc-800 text-zinc-400">
              PIN PROTECTED ARENA
            </Badge>
            <CardTitle className="text-xl font-extrabold text-white">
              {event.title}
            </CardTitle>
            <CardDescription className="text-xs text-zinc-400">
              This competition requires a 6-character PIN code from the host to enter and submit flags.
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-4 pt-4">
            <div className="space-y-2 text-left">
              <Label htmlFor="gate_pin" className="text-xs font-mono text-zinc-400">
                COMPETITION ACCESS PIN
              </Label>
              <Input
                id="gate_pin"
                placeholder="ENTER PIN CODE"
                className="font-mono text-center tracking-widest uppercase font-bold text-lg text-emerald-400 h-12 bg-zinc-900/80 border-zinc-800"
                value={gatePin}
                onChange={(e) => {
                  setGatePin(e.target.value.toUpperCase());
                  setGateError(null);
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    handleUnlockPin();
                  }
                }}
                maxLength={12}
                autoFocus
              />
            </div>

            {gateError && (
              <p className="text-xs text-red-400 text-center font-mono">{gateError}</p>
            )}

            <Button
              onClick={handleUnlockPin}
              disabled={unlocking || !gatePin.trim()}
              className="w-full bg-white text-black hover:bg-zinc-200 font-bold font-mono h-11 text-xs"
            >
              {unlocking ? "Verifying PIN..." : "Unlock Arena"}
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>

            <div className="pt-2">
              <Link href="/dashboard">
                <Button variant="ghost" size="sm" className="text-xs font-mono text-zinc-500 hover:text-zinc-300">
                  Return to Dashboard
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const status = getEventStatus(event.start_time, event.end_time);

  // ==============================================================================
  // 1. TIME-GATED VIEW: UPCOMING (BEFORE START TIME)
  // ==============================================================================
  if (status === "upcoming") {
    return (
      <div className="flex-1 flex items-center justify-center p-4 cyber-grid">
        <Card className="max-w-lg w-full border-zinc-800 bg-zinc-950/90 backdrop-blur-md shadow-2xl text-center py-8 px-4">
          <CardHeader className="space-y-2 pb-4">
            <div className="inline-flex items-center justify-center h-12 w-12 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-400 mx-auto">
              <Lock className="h-6 w-6 text-amber-400" />
            </div>
            <Badge variant="secondary" className="mx-auto text-xs font-mono">
              EVENT LOCKED
            </Badge>
            <CardTitle className="text-2xl font-extrabold text-white">
              {event.title}
            </CardTitle>
            <CardDescription className="text-xs text-zinc-400">
              The competition has not started yet. Questions will unlock automatically when the timer reaches zero.
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-6 pt-2">
            {/* Live Countdown Clock */}
            <div className="p-6 rounded-xl border border-zinc-800 bg-zinc-900/40">
              <div className="text-xs font-mono text-zinc-500 uppercase tracking-widest mb-1">
                COUNTDOWN TO COMMENCE
              </div>
              <div className="font-mono text-4xl sm:text-5xl font-extrabold tracking-wider text-amber-400">
                {formatTimeRemaining(timeUntilStart)}
              </div>
              <p className="text-xs text-zinc-400 font-mono mt-2">
                Starts at: {formatDate(event.start_time, true)}
              </p>
            </div>

            <div className="flex flex-col sm:flex-row justify-center gap-3">
              <Link href={`/events/${event.id}/scoreboard`}>
                <Button variant="outline" size="sm" className="w-full sm:w-auto border-zinc-700 font-mono text-xs">
                  <Trophy className="h-3.5 w-3.5 mr-1.5 text-amber-400" />
                  View Scoreboard Standings
                </Button>
              </Link>
              <Link href="/dashboard">
                <Button size="sm" variant="secondary" className="w-full sm:w-auto font-mono text-xs">
                  Dashboard
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // ==============================================================================
  // 2. TIME-GATED VIEW: ENDED (AFTER END TIME)
  // ==============================================================================
  if (status === "ended") {
    return (
      <div className="flex-1 flex items-center justify-center p-4 cyber-grid">
        <Card className="max-w-lg w-full border-zinc-800 bg-zinc-950/90 backdrop-blur-md shadow-2xl text-center py-8 px-4">
          <CardHeader className="space-y-2 pb-4">
            <div className="inline-flex items-center justify-center h-12 w-12 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-400 mx-auto">
              <Trophy className="h-6 w-6 text-amber-400" />
            </div>
            <Badge variant="outline" className="mx-auto text-xs font-mono border-zinc-800 text-zinc-400">
              COMPETITION CONCLUDED
            </Badge>
            <CardTitle className="text-2xl font-extrabold text-white">
              {event.title}
            </CardTitle>
            <CardDescription className="text-xs text-zinc-400">
              This event has ended. Submissions are closed and final flags have been tallied.
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-6 pt-2">
            <div className="p-5 rounded-xl border border-zinc-800 bg-zinc-900/40">
              <div className="text-xs font-mono text-zinc-500 uppercase tracking-widest mb-1">
                YOUR FINAL SCORE
              </div>
              <div className="font-mono text-4xl font-extrabold text-emerald-400">
                {userTotalPoints} PTS
              </div>
              <p className="text-xs text-zinc-400 font-mono mt-1">
                Flags Captured: {Object.keys(solvedMap).length} / {questions.length}
              </p>
            </div>

            <div className="flex flex-col sm:flex-row justify-center gap-3">
              <Link href={`/events/${event.id}/scoreboard`}>
                <Button size="lg" className="w-full sm:w-auto bg-white text-black hover:bg-zinc-200 font-bold font-mono text-xs">
                  <Trophy className="h-4 w-4 mr-2 text-amber-500" />
                  View Final Scoreboard
                </Button>
              </Link>
              <Link href="/dashboard">
                <Button size="lg" variant="outline" className="w-full sm:w-auto border-zinc-700 font-mono text-xs text-zinc-300">
                  Return to Dashboard
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // ==============================================================================
  // 3. ACTIVE VIEW: QUESTIONNAIRE & SUBMISSION INTERFACE
  // ==============================================================================
  const totalQuestions = questions.length;
  const solvedCount = Object.keys(solvedMap).length;

  return (
    <div className="flex-1 py-8 sm:py-12 cyber-grid">
      <div className="container mx-auto px-4 sm:px-6 max-w-4xl space-y-8">
        {/* Arena Header & Status Sticky Bar */}
        <div className="border-b border-zinc-800/80 pb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="flex h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
              <Badge variant="success" className="font-mono text-[10px]">
                ARENA LIVE
              </Badge>
              <span className="text-xs font-mono text-zinc-500">
                PIN: {event.pin_code}
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              {event.title}
            </h1>
            <p className="text-xs text-zinc-400 font-mono mt-1">
              Operator: <span className="text-zinc-200 font-bold">{user?.username}</span>
            </p>
          </div>

          <div className="flex items-center gap-4">
            {/* Live Time Remaining Clock */}
            <div className="px-3.5 py-2 rounded-lg border border-zinc-800 bg-zinc-950/80 font-mono text-right">
              <div className="text-[10px] text-zinc-500 uppercase tracking-widest flex items-center justify-end gap-1">
                <Clock className="h-3 w-3 text-emerald-400" />
                TIME REMAINING
              </div>
              <div className="text-lg sm:text-xl font-bold text-white tracking-wider">
                {formatTimeRemaining(timeRemaining)}
              </div>
            </div>

            <Link href={`/events/${event.id}/scoreboard`}>
              <Button size="sm" variant="outline" className="border-zinc-700 font-mono text-xs">
                <Trophy className="h-3.5 w-3.5 mr-1 text-amber-400" />
                Scoreboard
              </Button>
            </Link>
          </div>
        </div>

        {/* Progress Bar & Score Banner */}
        <div className="p-4 rounded-xl border border-zinc-800 bg-zinc-950/70 backdrop-blur-sm flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="space-y-1 w-full sm:w-auto">
            <div className="text-xs font-mono text-zinc-400">
              Captured: <strong className="text-emerald-400">{solvedCount}</strong> of{" "}
              <strong>{totalQuestions}</strong> Flags
            </div>
            <div className="w-full sm:w-64 h-2 bg-zinc-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-emerald-500 transition-all duration-500"
                style={{
                  width: `${totalQuestions > 0 ? (solvedCount / totalQuestions) * 100 : 0}%`,
                }}
              />
            </div>
          </div>

          <div className="flex items-center gap-3 font-mono">
            <span className="text-xs text-zinc-400 uppercase">Your Total Points:</span>
            <span className="text-xl font-extrabold text-emerald-400">
              {userTotalPoints} PTS
            </span>
          </div>
        </div>

        {/* Questionnaire List */}
        <div className="space-y-6">
          {questions.map((q, idx) => {
            const isSolved = Boolean(solvedMap[q.id]);
            const feedback = feedbacks[q.id];
            const isSubmitting = Boolean(submittingMap[q.id]);

            return (
              <Card
                key={q.id}
                className={`border transition-all ${
                  isSolved
                    ? "border-emerald-800/80 bg-zinc-950/90 shadow-[0_0_20px_rgba(16,185,129,0.05)]"
                    : "border-zinc-800 bg-zinc-950/80 hover:border-zinc-700"
                }`}
              >
                <CardHeader className="pb-3 border-b border-zinc-900/80">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="font-mono text-xs border-zinc-800">
                        Challenge #{idx + 1}
                      </Badge>
                      {isSolved && (
                        <Badge variant="success" className="font-mono text-xs gap-1">
                          <CheckCircle2 className="h-3.5 w-3.5" />
                          FLAG CAPTURED
                        </Badge>
                      )}
                    </div>

                    <Badge variant="points" className="font-mono text-xs">
                      {q.points} PTS
                    </Badge>
                  </div>

                  <CardTitle className="text-base text-white pt-2 font-mono leading-relaxed">
                    {q.prompt}
                  </CardTitle>
                </CardHeader>

                <CardContent className="space-y-4 pt-4">
                  {/* External Media Embed (if provided) */}
                  {q.media_url && (
                    <div className="rounded-lg border border-zinc-800/80 bg-zinc-900/40 p-3 space-y-2">
                      <div className="flex items-center justify-between text-xs font-mono text-zinc-400">
                        <span className="flex items-center gap-1.5">
                          <ImageIcon className="h-3.5 w-3.5 text-zinc-500" />
                          Attached Media Asset
                        </span>
                        <a
                          href={q.media_url}
                          target="_blank"
                          rel="noreferrer"
                          className="text-zinc-400 hover:text-white flex items-center gap-1 underline text-[11px]"
                        >
                          Open Raw
                          <ExternalLink className="h-3 w-3" />
                        </a>
                      </div>

                      <div className="max-h-72 overflow-hidden rounded border border-zinc-800 bg-black flex items-center justify-center">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={q.media_url}
                          alt="Challenge media"
                          className="max-h-72 object-contain w-full"
                          onError={(e) => {
                            // If not an image, show download/view fallback
                            (e.target as HTMLElement).style.display = "none";
                          }}
                        />
                      </div>
                    </div>
                  )}

                  {/* Submission form */}
                  <div className="space-y-2">
                    <div className="flex flex-col sm:flex-row gap-2">
                      <div className="relative flex-1">
                        <Flag className="absolute left-3 top-2.5 h-4 w-4 text-zinc-500" />
                        <Input
                          id={`flag-input-${q.id}`}
                          name={`ctfy_flag_${user?.id || 'anon'}_${q.id}`}
                          autoComplete="off"
                          autoCorrect="off"
                          autoCapitalize="off"
                          spellCheck={false}
                          data-lpignore="true"
                          data-1p-ignore="true"
                          placeholder={
                            isSolved
                              ? "Challenge solved!"
                              : "Enter flag (e.g. CTFy{secret_flag})"
                          }
                          disabled={isSolved || isSubmitting}
                          value={isSolved ? "" : (inputs[q.id] || "")}
                          onChange={(e) =>
                            setInputs((prev) => ({ ...prev, [q.id]: e.target.value }))
                          }
                          onKeyDown={(e) => {
                            if (e.key === "Enter" && !isSolved && !isSubmitting) {
                              e.preventDefault();
                              handleAnswerSubmit(q.id);
                            }
                          }}
                          className={`pl-9 font-mono text-sm ${
                            isSolved
                              ? "bg-zinc-900/40 border-emerald-900/60 text-emerald-400 cursor-not-allowed"
                              : "bg-zinc-900/80 border-zinc-800 text-zinc-100"
                          }`}
                        />
                      </div>

                      <Button
                        onClick={() => handleAnswerSubmit(q.id)}
                        disabled={isSolved || isSubmitting || !inputs[q.id]?.trim()}
                        className={
                          isSolved
                            ? "bg-emerald-950 text-emerald-400 border border-emerald-800 cursor-not-allowed font-mono text-xs"
                            : "bg-white text-black hover:bg-zinc-200 font-bold font-mono text-xs px-5"
                        }
                      >
                        {isSolved ? (
                          <>
                            <CheckCircle2 className="h-3.5 w-3.5 mr-1" />
                            Solved
                          </>
                        ) : isSubmitting ? (
                          "Verifying..."
                        ) : (
                          <>
                            <Send className="h-3.5 w-3.5 mr-1.5" />
                            Submit Flag
                          </>
                        )}
                      </Button>
                    </div>

                    {/* Feedback message */}
                    {feedback && (
                      <div
                        className={`p-2.5 rounded text-xs font-mono flex items-center gap-2 ${
                          feedback.status === "correct" || feedback.status === "already_solved"
                            ? "bg-emerald-950/60 border border-emerald-800 text-emerald-300"
                            : "bg-red-950/60 border border-red-800 text-red-300"
                        }`}
                      >
                        {feedback.status === "correct" || feedback.status === "already_solved" ? (
                          <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-400" />
                        ) : (
                          <AlertCircle className="h-4 w-4 shrink-0 text-red-400" />
                        )}
                        <span>{feedback.message}</span>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default function PlayArenaPage() {
  return (
    <Suspense
      fallback={
        <div className="flex-1 flex items-center justify-center p-8 cyber-grid font-mono text-zinc-500">
          Loading Challenge Arena...
        </div>
      }
    >
      <PlayArenaContent />
    </Suspense>
  );
}

