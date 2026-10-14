"use client";

import { useEffect, useState, Suspense } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import {
  Trophy,
  Play,
  Clock,
  Shield,
  Medal,
  RefreshCw,
  ArrowLeft,
  Sparkles,
  Users,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { CTFEvent, Submission, LeaderboardEntry, getEventStatus } from "@/lib/types";
import {
  INITIAL_MOCK_EVENTS,
  INITIAL_MOCK_SUBMISSIONS,
  computeLeaderboard,
} from "@/lib/mock-data";
import { createClient, isSupabaseConfigured } from "@/lib/supabase/client";
import { formatDate } from "@/lib/utils";

function ScoreboardContent() {
  const params = useParams();
  const eventId = params.id as string;

  const [event, setEvent] = useState<CTFEvent | null>(null);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [isRealtimeActive, setIsRealtimeActive] = useState(false);

  useEffect(() => {
    if (!eventId) return;

    let channel: any = null;

    async function loadData() {
      if (!isSupabaseConfigured()) {
        const found = INITIAL_MOCK_EVENTS.find((e) => e.id === eventId);
        const eventSubs = INITIAL_MOCK_SUBMISSIONS[eventId] || [];

        setEvent(found || null);
        setLeaderboard(computeLeaderboard(eventSubs));
        setLoading(false);
        setIsRealtimeActive(true);
        return;
      }

      const supabase = createClient();

      // Fetch Event
      const { data: eventData } = await supabase
        .from("events")
        .select("*, host:profiles(username)")
        .eq("id", eventId)
        .single();

      if (eventData) {
        setEvent(eventData);
      }

      // Fetch Submissions
      const { data: subsData } = await supabase
        .from("submissions")
        .select("*, profiles(id, username)")
        .eq("event_id", eventId)
        .order("created_at", { ascending: false });

      if (subsData) {
        setLeaderboard(computeLeaderboard(subsData as Submission[]));
      }

      setLoading(false);

      // Realtime subscription on submissions
      channel = supabase
        .channel(`scoreboard-${eventId}`)
        .on(
          "postgres_changes",
          {
            event: "INSERT",
            schema: "public",
            table: "submissions",
            filter: `event_id=eq.${eventId}`,
          },
          async () => {
            // Re-fetch all submissions to recalculate rank standings
            const { data: freshSubs } = await supabase
              .from("submissions")
              .select("*, profiles(id, username)")
              .eq("event_id", eventId);

            if (freshSubs) {
              setLeaderboard(computeLeaderboard(freshSubs as Submission[]));
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

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center p-8 cyber-grid font-mono text-zinc-500">
        Loading Live Scoreboard Standings...
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
            <Link href="/dashboard">
              <Button size="sm" className="bg-white text-black font-semibold">
                Back to Dashboard
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  const status = getEventStatus(event.start_time, event.end_time);

  return (
    <div className="flex-1 py-8 sm:py-12 cyber-grid">
      <div className="container mx-auto px-4 sm:px-6 max-w-5xl space-y-8">
        {/* Header */}
        <div className="border-b border-zinc-800/80 pb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="flex h-2 w-2 rounded-full bg-amber-400 animate-pulse" />
              <Badge variant="points" className="font-mono text-[10px]">
                {status === "active" ? "LIVE REALTIME STANDINGS" : "FINAL LEADERBOARD"}
              </Badge>
              <span className="text-xs font-mono text-zinc-500">
                PIN: {event.pin_code}
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight flex items-center gap-2.5">
              <Trophy className="h-7 w-7 text-amber-400" />
              {event.title}
            </h1>
            <p className="text-xs text-zinc-400 font-mono mt-1">
              Host: <span className="text-zinc-200">{event.host?.username || "Host"}</span> • Active:{" "}
              {formatDate(event.start_time, true)} to {formatDate(event.end_time, true)}
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            <Link href={`/events/${event.id}/play`}>
              <Button size="sm" className="bg-white text-black hover:bg-zinc-200 font-mono text-xs font-bold">
                <Play className="h-3.5 w-3.5 mr-1.5 text-emerald-600" />
                Enter Challenge Arena
              </Button>
            </Link>
            <Link href="/dashboard">
              <Button variant="outline" size="sm" className="border-zinc-800 font-mono text-xs text-zinc-300">
                Dashboard
              </Button>
            </Link>
          </div>
        </div>

        {/* Podium for Top 3 */}
        {leaderboard.length >= 3 && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
            {/* Rank 2 */}
            <Card className="border-zinc-800 bg-zinc-950/70 text-center order-2 md:order-1 relative">
              <CardHeader className="pb-2">
                <div className="text-2xl mb-1">🥈</div>
                <Badge variant="outline" className="mx-auto font-mono text-xs border-zinc-700">
                  RANK #2
                </Badge>
                <CardTitle className="text-base text-zinc-200 mt-2 font-mono">
                  {leaderboard[1].username}
                </CardTitle>
              </CardHeader>
              <CardContent className="font-mono">
                <div className="text-2xl font-bold text-white">
                  {leaderboard[1].total_points} PTS
                </div>
                <div className="text-xs text-zinc-500 mt-1">
                  {leaderboard[1].solved_count} flags captured
                </div>
              </CardContent>
            </Card>

            {/* Rank 1 (Champion) */}
            <Card className="border-amber-700/60 bg-zinc-950/90 text-center order-1 md:order-2 relative shadow-[0_0_25px_rgba(245,158,11,0.08)]">
              <div className="absolute top-0 left-0 right-0 h-1 bg-amber-500" />
              <CardHeader className="pb-2">
                <div className="text-3xl mb-1">🥇</div>
                <Badge variant="points" className="mx-auto font-mono text-xs">
                  CHAMPION #1
                </Badge>
                <CardTitle className="text-lg text-white mt-2 font-mono font-bold">
                  {leaderboard[0].username}
                </CardTitle>
              </CardHeader>
              <CardContent className="font-mono">
                <div className="text-3xl font-extrabold text-amber-400">
                  {leaderboard[0].total_points} PTS
                </div>
                <div className="text-xs text-zinc-400 mt-1">
                  {leaderboard[0].solved_count} flags captured
                </div>
              </CardContent>
            </Card>

            {/* Rank 3 */}
            <Card className="border-zinc-800 bg-zinc-950/70 text-center order-3 md:order-3 relative">
              <CardHeader className="pb-2">
                <div className="text-2xl mb-1">🥉</div>
                <Badge variant="outline" className="mx-auto font-mono text-xs border-zinc-700">
                  RANK #3
                </Badge>
                <CardTitle className="text-base text-zinc-200 mt-2 font-mono">
                  {leaderboard[2].username}
                </CardTitle>
              </CardHeader>
              <CardContent className="font-mono">
                <div className="text-2xl font-bold text-white">
                  {leaderboard[2].total_points} PTS
                </div>
                <div className="text-xs text-zinc-500 mt-1">
                  {leaderboard[2].solved_count} flags captured
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Full Leaderboard Table */}
        <Card className="border-zinc-800 bg-zinc-950/80 backdrop-blur-md shadow-2xl">
          <CardHeader className="border-b border-zinc-900 pb-4 flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-base flex items-center gap-2">
                <Medal className="h-4 w-4 text-zinc-400" />
                Rankings Table
              </CardTitle>
              <CardDescription className="text-xs">
                Ties are automatically broken by earliest solve timestamp.
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-xs font-mono text-zinc-400">
                {leaderboard.length} Competitors
              </span>
            </div>
          </CardHeader>

          <CardContent className="pt-0">
            {leaderboard.length === 0 ? (
              <div className="py-12 text-center text-zinc-500 font-mono text-xs">
                No solvers on the board yet. Be the first to capture a flag!
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-20 font-mono text-xs">RANK</TableHead>
                    <TableHead className="font-mono text-xs">HACKER HANDLE</TableHead>
                    <TableHead className="font-mono text-xs text-center">FLAGS CAPTURED</TableHead>
                    <TableHead className="font-mono text-xs text-right">SCORE</TableHead>
                    <TableHead className="font-mono text-xs text-right">LAST CAPTURE TIME</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {leaderboard.map((entry, idx) => (
                    <TableRow key={entry.user_id} className="hover:bg-zinc-900/60">
                      <TableCell className="font-mono font-bold text-sm">
                        {idx === 0 ? (
                          <span className="text-amber-400 font-extrabold">#1 🥇</span>
                        ) : idx === 1 ? (
                          <span className="text-zinc-200 font-bold">#2 🥈</span>
                        ) : idx === 2 ? (
                          <span className="text-amber-600 font-bold">#3 🥉</span>
                        ) : (
                          <span className="text-zinc-500">#{idx + 1}</span>
                        )}
                      </TableCell>

                      <TableCell className="font-mono font-semibold text-white">
                        {entry.username}
                      </TableCell>

                      <TableCell className="font-mono text-center">
                        <Badge variant="outline" className="border-zinc-800 text-xs">
                          {entry.solved_count} solved
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
      </div>
    </div>
  );
}

export default function ScoreboardPage() {
  return (
    <Suspense
      fallback={
        <div className="flex-1 flex items-center justify-center p-8 cyber-grid font-mono text-zinc-500">
          Loading Live Scoreboard Standings...
        </div>
      }
    >
      <ScoreboardContent />
    </Suspense>
  );
}

