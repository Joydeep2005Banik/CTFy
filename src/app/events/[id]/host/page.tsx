"use client";

import { useEffect, useState, Suspense } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import {
  Copy,
  Check,
  Trophy,
  Users,
  Play,
  Clock,
  Radio,
  FileQuestion,
  ExternalLink,
  Shield,
  CheckCircle2,
  XCircle,
  RefreshCw,
  Share2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { CTFEvent, Submission, LeaderboardEntry, getEventStatus } from "@/lib/types";
import {
  INITIAL_MOCK_EVENTS,
  INITIAL_MOCK_QUESTIONS,
  INITIAL_MOCK_SUBMISSIONS,
  DEMO_USER,
  computeLeaderboard,
} from "@/lib/mock-data";
import { createClient, isSupabaseConfigured } from "@/lib/supabase/client";
import { formatDate, formatTimeRemaining } from "@/lib/utils";

function HostContent() {
  const params = useParams();
  const eventId = params.id as string;

  const [event, setEvent] = useState<CTFEvent | null>(null);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [copiedPin, setCopiedPin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [isRealtimeActive, setIsRealtimeActive] = useState(false);

  // Load event details & submissions
  useEffect(() => {
    if (!eventId) return;

    let channel: any = null;

    async function loadData() {
      if (!isSupabaseConfigured()) {
        const demoStored = localStorage.getItem("ctfy_demo_user");
        const uid = demoStored ? JSON.parse(demoStored).id : DEMO_USER.id;
        setCurrentUserId(uid);

        const foundEvent = INITIAL_MOCK_EVENTS.find((e) => e.id === eventId);
        const eventSubs = INITIAL_MOCK_SUBMISSIONS[eventId] || [];

        setEvent(foundEvent || null);
        setSubmissions(eventSubs);
        setLeaderboard(computeLeaderboard(eventSubs));
        setLoading(false);
        setIsRealtimeActive(true);
        return;
      }

      const supabase = createClient();
      const {
        data: { session },
      } = await supabase.auth.getSession();

      setCurrentUserId(session?.user?.id || null);

      // Fetch Event
      const { data: eventData } = await supabase
        .from("events")
        .select("*, host:profiles(username)")
        .eq("id", eventId)
        .single();

      // Fetch PIN for Host (Host-only RLS allows host to query event_pins)
      const { data: pinData } = await supabase
        .from("event_pins")
        .select("pin_code")
        .eq("event_id", eventId)
        .maybeSingle();

      if (eventData) {
        setEvent({
          ...eventData,
          pin_code: pinData?.pin_code || (eventData as any).pin_code || "N/A",
        });
      }

      // Fetch Submissions
      const { data: subsData } = await supabase
        .from("submissions")
        .select("*, profiles(id, username)")
        .eq("event_id", eventId)
        .order("created_at", { ascending: false });

      if (subsData) {
        setSubmissions(subsData as Submission[]);
        setLeaderboard(computeLeaderboard(subsData as Submission[]));
      }

      setLoading(false);

      // Setup Supabase Realtime Subscription
      channel = supabase
        .channel(`host-event-${eventId}`)
        .on(
          "postgres_changes",
          {
            event: "INSERT",
            schema: "public",
            table: "submissions",
            filter: `event_id=eq.${eventId}`,
          },
          async (payload) => {
            // Re-fetch or append new submission
            const { data: newSubWithProfile } = await supabase
              .from("submissions")
              .select("*, profiles(id, username)")
              .eq("id", payload.new.id)
              .single();

            if (newSubWithProfile) {
              setSubmissions((prev) => {
                const nextSubs = [newSubWithProfile as Submission, ...prev];
                setLeaderboard(computeLeaderboard(nextSubs));
                return nextSubs;
              });
            }
          }
        )
        .subscribe((status) => {
          setIsRealtimeActive(status === "SUBSCRIBED");
        });
    }

    loadData();

    return () => {
      if (channel) {
        const supabase = createClient();
        supabase.removeChannel(channel);
      }
    };
  }, [eventId]);

  const handleCopyPin = () => {
    if (!event || !event.pin_code) return;
    navigator.clipboard.writeText(event.pin_code);
    setCopiedPin(true);
    setTimeout(() => setCopiedPin(false), 2000);
  };

  const handleSimulateParticipant = () => {
    // Allows host to test live leaderboard updates in demo mode
    if (!event) return;
    const testUsers = ["shadow_fox", "byte_viper", "h4x_queen", "zerocool"];
    const randomUser = testUsers[Math.floor(Math.random() * testUsers.length)];
    const mockQuestions = INITIAL_MOCK_QUESTIONS[eventId] || [];
    const randomQ =
      mockQuestions[Math.floor(Math.random() * mockQuestions.length)] || {
        id: "q-test",
        points: 100,
      };

    const isCorrect = Math.random() > 0.3;
    const newSub: Submission = {
      id: `sub-sim-${Date.now()}`,
      event_id: eventId,
      question_id: randomQ.id,
      user_id: `user-sim-${randomUser}`,
      submitted_answer: isCorrect ? "CTFy{correct_flag}" : "wrong_guess",
      is_correct: isCorrect,
      points_awarded: isCorrect ? randomQ.points : 0,
      created_at: new Date().toISOString(),
      profiles: { id: `user-sim-${randomUser}`, username: randomUser, created_at: "" },
    };

    if (!INITIAL_MOCK_SUBMISSIONS[eventId]) {
      INITIAL_MOCK_SUBMISSIONS[eventId] = [];
    }
    INITIAL_MOCK_SUBMISSIONS[eventId].unshift(newSub);

    setSubmissions((prev) => {
      const nextSubs = [newSub, ...prev];
      setLeaderboard(computeLeaderboard(nextSubs));
      return nextSubs;
    });
  };

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center p-8 cyber-grid font-mono text-zinc-500">
        Initializing Host Command Center...
      </div>
    );
  }

  if (!event) {
    return (
      <div className="flex-1 flex items-center justify-center p-8 cyber-grid">
        <Card className="max-w-md w-full border-zinc-800 text-center py-8">
          <CardContent className="space-y-4">
            <Shield className="h-10 w-10 text-zinc-600 mx-auto" />
            <h2 className="text-xl font-bold text-white">Event Not Found</h2>
            <p className="text-xs text-zinc-400">
              The competition you are looking for does not exist or has been removed.
            </p>
            <Link href="/dashboard">
              <Button size="sm" className="bg-white text-black font-semibold">
                Return to Dashboard
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (currentUserId && event.host_id !== currentUserId) {
    return (
      <div className="flex-1 flex items-center justify-center p-8 cyber-grid">
        <Card className="max-w-md w-full border-zinc-800 text-center py-8">
          <CardContent className="space-y-4">
            <Shield className="h-10 w-10 text-amber-500 mx-auto" />
            <h2 className="text-xl font-bold text-white">Host Access Restricted</h2>
            <p className="text-xs text-zinc-400">
              Only the organizer of &quot;{event.title}&quot; can access the host management deck.
            </p>
            <div className="flex justify-center gap-3 pt-2">
              <Link href={`/events/${event.id}/play`}>
                <Button size="sm" className="bg-white text-black font-semibold text-xs">
                  Participant View
                </Button>
              </Link>
              <Link href="/dashboard">
                <Button size="sm" variant="outline" className="border-zinc-700 text-xs">
                  Dashboard
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const status = getEventStatus(event.start_time, event.end_time);

  return (
    <div className="flex-1 py-8 sm:py-12 cyber-grid">
      <div className="container mx-auto px-4 sm:px-6 max-w-6xl space-y-8">
        {/* Top Host Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-zinc-800/80 pb-6">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="flex h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-xs font-mono text-zinc-400 uppercase tracking-wider">
                HOST COMMAND DECK
              </span>
              <Badge variant="outline" className="font-mono text-[10px] border-zinc-800">
                {isRealtimeActive ? "REALTIME STREAM: ACTIVE" : "SYNCING"}
              </Badge>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              {event.title}
            </h1>
            <p className="text-xs sm:text-sm text-zinc-400 font-mono mt-1">
              Schedule: {formatDate(event.start_time, true)} → {formatDate(event.end_time, true)}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <Link href={`/events/${event.id}/play`}>
              <Button variant="outline" size="sm" className="border-zinc-700 text-xs font-mono">
                <Play className="h-3.5 w-3.5 mr-1.5 text-emerald-400" />
                Participant View
              </Button>
            </Link>
            <Link href={`/events/${event.id}/scoreboard`}>
              <Button size="sm" className="bg-white text-black hover:bg-zinc-200 text-xs font-mono font-bold">
                <Trophy className="h-3.5 w-3.5 mr-1.5 text-amber-500" />
                Public Scoreboard
              </Button>
            </Link>
          </div>
        </div>

        {/* Highlight Banner: PIN CODE DISTRIBUTION */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* PIN Card */}
          <Card className="md:col-span-1 border-zinc-800 bg-zinc-950/90 shadow-xl relative overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-1 bg-emerald-500" />
            <CardHeader className="pb-2">
              <CardDescription className="text-xs font-mono uppercase tracking-wider text-zinc-400">
                Distribute PIN to Competitors
              </CardDescription>
              <div className="flex items-center justify-between pt-1">
                <div className="font-mono text-3xl sm:text-4xl font-extrabold tracking-widest text-emerald-400">
                  {event.pin_code}
                </div>
                <Button
                  onClick={handleCopyPin}
                  size="sm"
                  variant="outline"
                  className="border-zinc-700 hover:border-zinc-500 font-mono text-xs"
                >
                  {copiedPin ? (
                    <>
                      <Check className="h-3.5 w-3.5 mr-1.5 text-emerald-400" />
                      Copied!
                    </>
                  ) : (
                    <>
                      <Copy className="h-3.5 w-3.5 mr-1.5" />
                      Copy PIN
                    </>
                  )}
                </Button>
              </div>
            </CardHeader>
            <CardContent className="pt-2 text-xs text-zinc-400 font-mono space-y-1">
              <p>Participants join at: <strong className="text-zinc-200">/join</strong></p>
              <p className="text-zinc-500 text-[11px]">
                PIN access enforces exact competition start & end timestamps automatically.
              </p>
            </CardContent>
          </Card>

          {/* Quick Metrics */}
          <Card className="border-zinc-800 bg-zinc-950/90 shadow-xl">
            <CardHeader className="pb-2">
              <CardDescription className="text-xs font-mono uppercase tracking-wider text-zinc-400">
                Live Engagement
              </CardDescription>
              <div className="flex items-baseline gap-4 pt-1">
                <div className="font-mono text-3xl font-extrabold text-white">
                  {leaderboard.length}
                </div>
                <span className="text-xs text-zinc-400 font-mono">active competitors</span>
              </div>
            </CardHeader>
            <CardContent className="pt-2 text-xs text-zinc-400 font-mono space-y-1">
              <div className="flex justify-between">
                <span>Total Flag Submissions:</span>
                <strong className="text-white font-bold">{submissions.length}</strong>
              </div>
              <div className="flex justify-between">
                <span>Successful Captures:</span>
                <strong className="text-emerald-400 font-bold">
                  {submissions.filter((s) => s.is_correct).length}
                </strong>
              </div>
            </CardContent>
          </Card>

          {/* Status & Test Control */}
          <Card className="border-zinc-800 bg-zinc-950/90 shadow-xl">
            <CardHeader className="pb-2">
              <CardDescription className="text-xs font-mono uppercase tracking-wider text-zinc-400">
                Gate State & Simulation
              </CardDescription>
              <div className="pt-1">
                {status === "active" ? (
                  <Badge variant="success" className="text-xs py-1 px-3">
                    COMPETITION RUNNING
                  </Badge>
                ) : status === "upcoming" ? (
                  <Badge variant="secondary" className="text-xs py-1 px-3">
                    COUNTDOWN / UPCOMING
                  </Badge>
                ) : (
                  <Badge variant="outline" className="text-xs py-1 px-3 border-zinc-800">
                    ROUND CONCLUDED
                  </Badge>
                )}
              </div>
            </CardHeader>
            <CardContent className="pt-2 space-y-2">
              <Button
                size="sm"
                variant="outline"
                onClick={handleSimulateParticipant}
                className="w-full border-zinc-800 hover:border-zinc-600 text-zinc-300 font-mono text-xs"
              >
                <Radio className="h-3.5 w-3.5 mr-1.5 text-emerald-400" />
                Simulate Competitor Solve (Test Realtime)
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Real-time Standings Table */}
        <Card className="border-zinc-800 bg-zinc-950/80 backdrop-blur-md shadow-2xl">
          <CardHeader className="border-b border-zinc-900 pb-4 flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-lg flex items-center gap-2">
                <Trophy className="h-5 w-5 text-amber-400" />
                Live Host Leaderboard
              </CardTitle>
              <CardDescription>
                Updates automatically via Supabase Realtime as flags are cracked.
              </CardDescription>
            </div>
            <Badge variant="cyber" className="font-mono text-xs">
              {leaderboard.length} Ranked
            </Badge>
          </CardHeader>

          <CardContent className="pt-0">
            {leaderboard.length === 0 ? (
              <div className="py-12 text-center text-zinc-500 font-mono text-xs">
                No submissions received yet. Distribute PIN <span className="text-emerald-400 font-bold">{event.pin_code}</span> to your participants!
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-16 font-mono text-xs">RANK</TableHead>
                    <TableHead className="font-mono text-xs">HACKER HANDLE</TableHead>
                    <TableHead className="font-mono text-xs text-center">SOLVED</TableHead>
                    <TableHead className="font-mono text-xs text-right">TOTAL POINTS</TableHead>
                    <TableHead className="font-mono text-xs text-right">LAST CAPTURE</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {leaderboard.map((entry, idx) => (
                    <TableRow key={entry.user_id}>
                      <TableCell className="font-mono font-bold text-sm">
                        {idx === 0 ? (
                          <span className="text-amber-400">#1 🥇</span>
                        ) : idx === 1 ? (
                          <span className="text-zinc-300">#2 🥈</span>
                        ) : idx === 2 ? (
                          <span className="text-amber-600">#3 🥉</span>
                        ) : (
                          `#${idx + 1}`
                        )}
                      </TableCell>
                      <TableCell className="font-mono font-semibold text-white">
                        {entry.username}
                      </TableCell>
                      <TableCell className="font-mono text-center">
                        <Badge variant="outline" className="border-zinc-800 text-xs">
                          {entry.solved_count} flags
                        </Badge>
                      </TableCell>
                      <TableCell className="font-mono text-right font-extrabold text-emerald-400 text-base">
                        {entry.total_points}
                      </TableCell>
                      <TableCell className="font-mono text-right text-xs text-zinc-400">
                        {entry.last_submission_time
                          ? new Date(entry.last_submission_time).toLocaleTimeString()
                          : "—"}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        {/* Live Submissions Feed / Log */}
        <Card className="border-zinc-800 bg-zinc-950/80 backdrop-blur-md shadow-2xl">
          <CardHeader className="border-b border-zinc-900 pb-4">
            <CardTitle className="text-base flex items-center gap-2">
              <Radio className="h-4 w-4 text-emerald-400" />
              Live Audit Feed (Recent Submissions)
            </CardTitle>
            <CardDescription className="text-xs">
              Real-time audit log of all flag verification attempts across questions.
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-0">
            {submissions.length === 0 ? (
              <div className="py-8 text-center text-zinc-500 font-mono text-xs">
                Awaiting first submission attempt...
              </div>
            ) : (
              <div className="divide-y divide-zinc-900 max-h-80 overflow-y-auto">
                {submissions.slice(0, 20).map((sub) => (
                  <div key={sub.id} className="py-3 px-2 flex items-center justify-between text-xs font-mono">
                    <div className="flex items-center gap-3">
                      {sub.is_correct ? (
                        <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
                      ) : (
                        <XCircle className="h-4 w-4 text-red-400 shrink-0" />
                      )}
                      <div>
                        <span className="font-bold text-white">
                          {sub.profiles?.username || `user_${sub.user_id.slice(0, 6)}`}
                        </span>
                        <span className="text-zinc-500 mx-2">•</span>
                        <span className={sub.is_correct ? "text-emerald-400" : "text-zinc-400"}>
                          {sub.is_correct ? "Captured Flag" : "Incorrect Submission"}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-4">
                      {sub.is_correct && (
                        <Badge variant="points" className="text-[11px] py-0 px-2">
                          +{sub.points_awarded} pts
                        </Badge>
                      )}
                      <span className="text-zinc-500 text-[11px]">
                        {new Date(sub.created_at).toLocaleTimeString()}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default function HostManagementPage() {
  return (
    <Suspense
      fallback={
        <div className="flex-1 flex items-center justify-center p-8 cyber-grid font-mono text-zinc-500">
          Initializing Host Command Center...
        </div>
      }
    >
      <HostContent />
    </Suspense>
  );
}
