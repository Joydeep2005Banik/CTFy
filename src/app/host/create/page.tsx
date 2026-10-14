"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter } from "next/navigation";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Plus,
  Trash2,
  Sparkles,
  ArrowUp,
  ArrowDown,
  Calendar,
  Clock,
  KeyRound,
  FileQuestion,
  Image as ImageIcon,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  Wand2,
  Globe,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CreateEventSchema, EventFormValues } from "@/lib/validations";
import { createEventAction } from "@/lib/actions";
import { formatDate } from "@/lib/utils";

function generatePin(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let result = "";
  for (let i = 0; i < 6; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

function formatToLocalDatetimeInput(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");
  return `${year}-${month}-${day}T${hours}:${minutes}`;
}

export function parseLocalDateTimeToIso(datetimeLocalValue: string): string {
  if (!datetimeLocalValue) return new Date().toISOString();
  if (datetimeLocalValue.includes("Z") || datetimeLocalValue.includes("+") || /T\d{2}:\d{2}(:\d{2})?-\d{2}:\d{2}/.test(datetimeLocalValue)) {
    return new Date(datetimeLocalValue).toISOString();
  }
  const [dPart, tPart] = datetimeLocalValue.split("T");
  if (!dPart || !tPart) {
    return new Date(datetimeLocalValue).toISOString();
  }
  const [y, m, d] = dPart.split("-").map(Number);
  const [hh, mm] = tPart.split(":").map(Number);
  return new Date(y, m - 1, d, hh, mm, 0).toISOString();
}

function CreateHostEventContent() {
  const router = useRouter();
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [detectedTz, setDetectedTz] = useState<string>("");

  const {
    register,
    control,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<EventFormValues>({
    resolver: zodResolver(CreateEventSchema),
    defaultValues: {
      title: "",
      pin_code: "CTF892",
      start_time: "2026-10-14T20:00",
      end_time: "2026-10-14T22:00",
      questions: [
        {
          prompt: "Web Exploitation: Inspect this target and find the hidden flag.",
          media_url: "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=800&auto=format&fit=crop&q=80",
          correct_answer: "CTFy{first_blood_flag}",
          points: 100,
          order_index: 0,
        },
      ],
    },
  });

  // Dynamically set client time once mounted in user's local timezone
  useEffect(() => {
    const start = new Date();
    const end = new Date(Date.now() + 4 * 3600 * 1000);
    setValue("start_time", formatToLocalDatetimeInput(start));
    setValue("end_time", formatToLocalDatetimeInput(end));
    setValue("pin_code", generatePin());

    try {
      const tzName = Intl.DateTimeFormat().resolvedOptions().timeZone;
      const offsetMin = new Date().getTimezoneOffset();
      const sign = offsetMin <= 0 ? "+" : "-";
      const hours = String(Math.floor(Math.abs(offsetMin) / 60)).padStart(2, "0");
      const mins = String(Math.abs(offsetMin) % 60).padStart(2, "0");
      setDetectedTz(`${tzName} (UTC${sign}${hours}:${mins})`);
    } catch {
      setDetectedTz("Local Time");
    }
  }, [setValue]);

  const { fields, append, remove, move } = useFieldArray({
    control,
    name: "questions",
  });

  const watchQuestions = watch("questions");
  const watchStartTime = watch("start_time");
  const watchEndTime = watch("end_time");

  const onSubmit = async (data: EventFormValues) => {
    setSubmitError(null);
    setSubmitting(true);

    try {
      // Explicitly convert user's local input dates to standard UTC ISO strings
      // and attach the user's timezone offset for absolute precision
      const payload: EventFormValues = {
        ...data,
        start_time: parseLocalDateTimeToIso(data.start_time),
        end_time: parseLocalDateTimeToIso(data.end_time),
        timezone_offset: new Date().getTimezoneOffset(),
      };

      const res = await createEventAction(payload);
      if (!res.success) {
        setSubmitError(res.error || "Failed to create event.");
        setSubmitting(false);
        return;
      }

      // Redirect directly to host dashboard
      router.push(`/events/${res.eventId}/host`);
    } catch (err: unknown) {
      setSubmitError(err instanceof Error ? err.message : "Unexpected error.");
      setSubmitting(false);
    }
  };

  const handleAddQuestion = () => {
    append({
      prompt: "",
      media_url: "",
      correct_answer: "",
      points: 100,
      order_index: fields.length,
    });
  };

  return (
    <div className="flex-1 py-8 sm:py-12 cyber-grid">
      <div className="container mx-auto px-4 sm:px-6 max-w-4xl space-y-8">
        {/* Header */}
        <div className="border-b border-zinc-800/80 pb-6">
          <div className="flex items-center gap-2 text-xs font-mono text-zinc-400 uppercase tracking-wider mb-1">
            <span className="h-2 w-2 rounded-full bg-emerald-400" />
            COMPETITION ARCHITECT
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Host a Capture The Flag Event
          </h1>
          <p className="text-sm text-zinc-400 mt-1">
            Build challenge rounds in Google Forms style. No server configurations required.
          </p>
        </div>

        {submitError && (
          <div className="p-4 rounded-lg bg-red-950/60 border border-red-800 text-red-200 text-sm flex items-center gap-3">
            <AlertCircle className="h-5 w-5 text-red-400 shrink-0" />
            <span>{submitError}</span>
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
          {/* Section 1: Event Details */}
          <Card className="border-zinc-800 bg-zinc-950/80 backdrop-blur-md shadow-xl">
            <CardHeader className="border-b border-zinc-900 pb-4">
              <CardTitle className="text-lg flex items-center gap-2">
                <FileQuestion className="h-5 w-5 text-zinc-400" />
                1. Event Metadata & Scheduling
              </CardTitle>
              <CardDescription>
                Define the competition title, access PIN code, and active time gate.
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-5 pt-6">
              <div className="space-y-2">
                <Label htmlFor="title" className="text-xs font-mono">
                  EVENT TITLE *
                </Label>
                <Input
                  id="title"
                  placeholder="e.g. University CyberSec Fall Invitational 2026"
                  className="bg-zinc-900/80 border-zinc-800 text-base"
                  {...register("title")}
                />
                {errors.title && (
                  <p className="text-xs text-red-400">{errors.title.message}</p>
                )}
              </div>

              {/* Detected Timezone Banner */}
              <div className="flex items-center gap-2 text-xs font-mono text-zinc-400 bg-zinc-900/60 px-3 py-2 rounded-md border border-zinc-800">
                <Globe className="h-3.5 w-3.5 text-emerald-400 shrink-0" />
                <span>
                  Host Timezone: <strong className="text-zinc-200">{detectedTz || "Detecting..."}</strong>. Schedules will match your local time.
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* PIN Code */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="pin_code" className="text-xs font-mono">
                      EVENT PIN CODE *
                    </Label>
                    <button
                      type="button"
                      onClick={() => setValue("pin_code", generatePin())}
                      className="text-[11px] font-mono text-zinc-400 hover:text-white flex items-center gap-1"
                    >
                      <Wand2 className="h-3 w-3" />
                      Regen
                    </button>
                  </div>
                  <div className="relative">
                    <KeyRound className="absolute left-3 top-2.5 h-4 w-4 text-zinc-500" />
                    <Input
                      id="pin_code"
                      placeholder="e.g. 482910"
                      className="pl-9 bg-zinc-900/80 border-zinc-800 font-mono font-bold tracking-wider uppercase text-emerald-400"
                      {...register("pin_code")}
                    />
                  </div>
                  {errors.pin_code && (
                    <p className="text-xs text-red-400">{errors.pin_code.message}</p>
                  )}
                </div>

                {/* Start Time */}
                <div className="space-y-2">
                  <Label htmlFor="start_time" className="text-xs font-mono">
                    START DATE & TIME *
                  </Label>
                  <div className="relative">
                    <Clock className="absolute left-3 top-2.5 h-4 w-4 text-zinc-500" />
                    <Input
                      id="start_time"
                      type="datetime-local"
                      className="pl-9 bg-zinc-900/80 border-zinc-800 font-mono text-xs"
                      {...register("start_time")}
                    />
                  </div>
                  {watchStartTime && (
                    <p className="text-[10px] font-mono text-emerald-400/90 truncate">
                      ✓ Starts: {formatDate(parseLocalDateTimeToIso(watchStartTime), true)}
                    </p>
                  )}
                  {errors.start_time && (
                    <p className="text-xs text-red-400">{errors.start_time.message}</p>
                  )}
                </div>

                {/* End Time */}
                <div className="space-y-2">
                  <Label htmlFor="end_time" className="text-xs font-mono">
                    END DATE & TIME *
                  </Label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-2.5 h-4 w-4 text-zinc-500" />
                    <Input
                      id="end_time"
                      type="datetime-local"
                      className="pl-9 bg-zinc-900/80 border-zinc-800 font-mono text-xs"
                      {...register("end_time")}
                    />
                  </div>
                  {watchEndTime && (
                    <p className="text-[10px] font-mono text-emerald-400/90 truncate">
                      ✓ Ends: {formatDate(parseLocalDateTimeToIso(watchEndTime), true)}
                    </p>
                  )}
                  {errors.end_time && (
                    <p className="text-xs text-red-400">{errors.end_time.message}</p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Section 2: Google Forms-Style Dynamic Questions */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold text-white tracking-tight flex items-center gap-2">
                  <FileQuestion className="h-5 w-5 text-zinc-400" />
                  2. Challenge Questions ({fields.length})
                </h2>
                <p className="text-xs text-zinc-400">
                  Questions appear in the order shown. Flags are kept strictly secret on the server.
                </p>
              </div>

              <Button
                type="button"
                onClick={handleAddQuestion}
                variant="outline"
                size="sm"
                className="border-zinc-700 hover:border-zinc-500 text-xs font-mono"
              >
                <Plus className="h-3.5 w-3.5 mr-1" />
                Add Question Card
              </Button>
            </div>

            {errors.questions?.message && (
              <p className="text-xs text-red-400">{errors.questions.message}</p>
            )}

            <div className="space-y-4">
              {fields.map((field, index) => {
                const currentMedia = watchQuestions?.[index]?.media_url;

                return (
                  <Card
                    key={field.id}
                    className="border-zinc-800 bg-zinc-950/90 shadow-lg relative group transition-all"
                  >
                    <div className="absolute left-0 top-0 bottom-0 w-1 bg-zinc-800 group-focus-within:bg-white transition-colors rounded-l-xl" />

                    <CardHeader className="pb-3 flex flex-row items-center justify-between border-b border-zinc-900">
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="font-mono text-xs border-zinc-700">
                          Question #{index + 1}
                        </Badge>
                        <span className="text-xs text-zinc-500 font-mono">
                          Order Index: {index}
                        </span>
                      </div>

                      <div className="flex items-center gap-1">
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          disabled={index === 0}
                          onClick={() => move(index, index - 1)}
                          className="h-7 w-7 text-zinc-500 hover:text-white disabled:opacity-30"
                          title="Move up"
                        >
                          <ArrowUp className="h-3.5 w-3.5" />
                        </Button>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          disabled={index === fields.length - 1}
                          onClick={() => move(index, index + 1)}
                          className="h-7 w-7 text-zinc-500 hover:text-white disabled:opacity-30"
                          title="Move down"
                        >
                          <ArrowDown className="h-3.5 w-3.5" />
                        </Button>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          disabled={fields.length <= 1}
                          onClick={() => remove(index)}
                          className="h-7 w-7 text-red-400 hover:text-red-300 hover:bg-red-950/40 disabled:opacity-30 ml-1"
                          title="Delete question"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </CardHeader>

                    <CardContent className="space-y-4 pt-4">
                      {/* Prompt */}
                      <div className="space-y-2">
                        <Label className="text-xs font-mono">
                          QUESTION PROMPT / DESCRIPTION *
                        </Label>
                        <textarea
                          placeholder="Describe the challenge scenario, clues, or problem statement..."
                          rows={3}
                          className="w-full rounded-md border border-zinc-800 bg-zinc-900/70 p-3 text-sm text-zinc-100 placeholder:text-zinc-600 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-zinc-400 font-sans"
                          {...register(`questions.${index}.prompt` as const)}
                        />
                        {errors.questions?.[index]?.prompt && (
                          <p className="text-xs text-red-400">
                            {errors.questions[index]?.prompt?.message}
                          </p>
                        )}
                      </div>

                      {/* External Media Link */}
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <Label className="text-xs font-mono flex items-center gap-1.5">
                            <ImageIcon className="h-3.5 w-3.5 text-zinc-400" />
                            EXTERNAL MEDIA LINK (OPTIONAL)
                          </Label>
                          <span className="text-[11px] text-zinc-500">
                            Paste public image or asset link
                          </span>
                        </div>
                        <Input
                          placeholder="https://images.unsplash.com/... or https://example.com/target-asset.png"
                          className="bg-zinc-900/70 border-zinc-800 font-mono text-xs"
                          {...register(`questions.${index}.media_url` as const)}
                        />
                        {errors.questions?.[index]?.media_url && (
                          <p className="text-xs text-red-400">
                            {errors.questions[index]?.media_url?.message}
                          </p>
                        )}

                        {/* Image Preview if provided */}
                        {currentMedia && currentMedia.startsWith("http") && (
                          <div className="mt-2 rounded-lg border border-zinc-800 bg-zinc-900/40 p-2 flex items-center gap-3">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                              src={currentMedia}
                              alt="Asset Preview"
                              className="h-16 w-16 object-cover rounded border border-zinc-800"
                              onError={(e) => {
                                (e.target as HTMLElement).style.display = "none";
                              }}
                            />
                            <div className="text-xs text-zinc-400">
                              <span className="text-emerald-400 font-mono font-medium">✓ Media Attached:</span>
                              <p className="truncate max-w-sm text-zinc-500 text-[11px]">{currentMedia}</p>
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Flag and Points */}
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-1">
                        <div className="sm:col-span-2 space-y-2">
                          <Label className="text-xs font-mono text-emerald-400">
                            CORRECT ANSWER / SECRET FLAG *
                          </Label>
                          <Input
                            placeholder="e.g. CTFy{h4ck3r_m4st3r_2026}"
                            className="bg-zinc-900/80 border-zinc-800 font-mono text-emerald-400 tracking-wider"
                            {...register(`questions.${index}.correct_answer` as const)}
                          />
                          <p className="text-[11px] text-zinc-500 font-mono">
                            Kept secret on server. Checked via exact match.
                          </p>
                          {errors.questions?.[index]?.correct_answer && (
                            <p className="text-xs text-red-400">
                              {errors.questions[index]?.correct_answer?.message}
                            </p>
                          )}
                        </div>

                        <div className="space-y-2">
                          <Label className="text-xs font-mono">
                            POINT VALUE *
                          </Label>
                          <Input
                            type="number"
                            min={1}
                            placeholder="100"
                            className="bg-zinc-900/80 border-zinc-800 font-mono font-bold"
                            {...register(`questions.${index}.points` as const, {
                              valueAsNumber: true,
                            })}
                          />
                          {errors.questions?.[index]?.points && (
                            <p className="text-xs text-red-400">
                              {errors.questions[index]?.points?.message}
                            </p>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>

            <Button
              type="button"
              onClick={handleAddQuestion}
              variant="outline"
              className="w-full border-dashed border-zinc-800 hover:border-zinc-700 bg-zinc-950/40 text-zinc-400 hover:text-white font-mono text-xs h-11"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Another Challenge Card
            </Button>
          </div>

          {/* Submit Actions */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-zinc-800 pt-6">
            <div className="text-xs text-zinc-500 font-mono">
              All questions validated. Ready to deploy event PIN.
            </div>

            <Button
              type="submit"
              disabled={submitting}
              size="lg"
              className="w-full sm:w-auto bg-white text-black hover:bg-zinc-200 font-bold px-8 h-12 text-sm"
            >
              {submitting ? "Publishing Competition..." : "Publish & Generate Host Dashboard"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function CreateHostEventPage() {
  return (
    <Suspense
      fallback={
        <div className="flex-1 flex items-center justify-center p-8 cyber-grid font-mono text-zinc-500">
          Loading Competition Architect...
        </div>
      }
    >
      <CreateHostEventContent />
    </Suspense>
  );
}

