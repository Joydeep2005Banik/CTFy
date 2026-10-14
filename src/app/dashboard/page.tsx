"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  PlusCircle,
  KeyRound,
  Play,
  Trophy,
  Calendar,
  Clock,
  ExternalLink,
  Shield,
  Layers,
  ArrowRight,
  Hash,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CTFEvent, getEventStatus } from "@/lib/types";
import { INITIAL_MOCK_EVENTS, DEMO_USER } from "@/lib/mock-data";
import { createClient, isSupabaseConfigured } from "@/lib/supabase/client";
import { formatDate } from "@/lib/utils";

export default function DashboardPage() {
  const [events, setEvents] = useState<CTFEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<{ id: string; username: string } | null>(null);

  useEffect(() => {
    async function loadData() {
      if (!isSupabaseConfigured()) {
        const demoStored = localStorage.getItem("ctfy_demo_user");
        const currentUser = demoStored
          ? JSON.parse(demoStored)
          : { id: DEMO_USER.id, username: DEMO_USER.username };

        setUser(currentUser);
        setEvents(INITIAL_MOCK_EVENTS);
        setLoading(false);
        return;
      }

      const supabase = createClient();
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (session?.user) {
        const { data: profile } = await supabase
          .from("profiles")
          .select("username")
          .eq("id", session.user.id)
          .single();

        setUser({
          id: session.user.id,
          username: profile?.username || session.user.email?.split("@")[0] || "operator",
        });

        // Fetch events hosted or available
        const { data: eventList } = await supabase
          .from("events")
          .select("*, host:profiles(username), questions(count), submissions(count)")
          .order("created_at", { ascending: false });

        if (eventList) {
          const mapped: CTFEvent[] = eventList.map((e: any) => ({
            ...e,
            _count: {
              questions: e.questions ? e.questions.length : 0,
              submissions: e.submissions ? e.submissions.length : 0,
            },
          }));
          setEvents(mapped);
        }
      }
      setLoading(false);
    }

    loadData();
  }, []);

  return (
    <div className="flex-1 py-8 sm:py-12 cyber-grid">
      <div className="container mx-auto px-4 sm:px-6 max-w-6xl space-y-8">
        {/* Welcome Header */}
        <div className="border-b border-zinc-800/80 pb-6">
          <div>
            <div className="flex items-center gap-2 text-xs font-mono text-zinc-400 uppercase tracking-wider mb-1">
              <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
              OPERATOR COMMAND CENTER
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Welcome back,{" "}
              <span className="font-mono text-zinc-300">
                {user?.username || "Agent"}
              </span>
            </h1>
            <p className="text-sm text-zinc-400 mt-0.5">
              Select an action below to launch or participate in a competition.
            </p>
          </div>
        </div>

        {/* Primary Action Hero Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Action 1: Host a CTF */}
          <Card className="border-zinc-800 bg-zinc-950/80 hover:border-zinc-700 transition-all group overflow-hidden relative">
            <div className="absolute top-0 right-0 w-32 h-32 bg-zinc-800/10 rounded-full blur-2xl group-hover:bg-zinc-700/20 transition-colors" />
            <CardHeader className="pb-3">
              <div className="h-10 w-10 rounded-lg bg-zinc-900 border border-zinc-800 flex items-center justify-center mb-2 text-zinc-100">
                <PlusCircle className="h-5 w-5" />
              </div>
              <CardTitle className="text-xl">Host a CTF</CardTitle>
              <CardDescription>
                Create a targeted competition in under 2 minutes. Add prompts, external image/asset links, and secret flags with Google Forms simplicity.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Link href="/host/create">
                <Button className="w-full bg-white text-black hover:bg-zinc-200 font-semibold font-mono text-xs h-10">
                  Launch Challenge Builder
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </CardContent>
          </Card>

          {/* Action 2: Join a CTF */}
          <Card className="border-zinc-800 bg-zinc-950/80 hover:border-zinc-700 transition-all group overflow-hidden relative">
            <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-950/10 rounded-full blur-2xl group-hover:bg-emerald-900/20 transition-colors" />
            <CardHeader className="pb-3">
              <div className="h-10 w-10 rounded-lg bg-zinc-900 border border-zinc-800 flex items-center justify-center mb-2 text-emerald-400">
                <KeyRound className="h-5 w-5" />
              </div>
              <CardTitle className="text-xl">Join a CTF</CardTitle>
              <CardDescription>
                Got an event code from a friend or club host? Enter the PIN code to jump straight into the time-gated arena.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Link href="/join">
                <Button variant="cyber" className="w-full font-mono text-xs h-10">
                  Enter Competition PIN
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>

        {/* Competitions Section */}
        <div className="space-y-4 pt-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
              <Layers className="h-5 w-5 text-zinc-400" />
              Active & Recent Competitions
            </h2>
            <span className="text-xs font-mono text-zinc-500">
              {events.length} events detected
            </span>
          </div>

          {loading ? (
            <div className="p-12 text-center text-zinc-500 font-mono text-sm border border-zinc-800 rounded-xl bg-zinc-950/40">
              Scanning competition registry...
            </div>
          ) : events.length === 0 ? (
            <Card className="border-dashed border-zinc-800 bg-zinc-950/30 text-center py-12">
              <CardContent className="space-y-3">
                <Shield className="h-10 w-10 text-zinc-600 mx-auto" />
                <h3 className="text-base font-semibold text-zinc-300">No competitions found</h3>
                <p className="text-xs text-zinc-500 max-w-sm mx-auto">
                  You haven&apos;t joined or created any CTFs yet. Host your first round or join with a PIN code!
                </p>
                <div className="pt-2">
                  <Link href="/host/create">
                    <Button size="sm" className="bg-white text-black font-semibold text-xs">
                      Create First CTF
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {events.map((event) => {
                const status = getEventStatus(event.start_time, event.end_time);

                return (
                  <Card
                    key={event.id}
                    className="border-zinc-800 bg-zinc-950/70 hover:border-zinc-700/80 transition-all flex flex-col justify-between"
                  >
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between gap-2 mb-2">
                        {status === "active" ? (
                          <Badge variant="success" className="gap-1 py-0.5 text-[11px]">
                            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-ping" />
                            ACTIVE
                          </Badge>
                        ) : status === "upcoming" ? (
                          <Badge variant="secondary" className="text-zinc-400 py-0.5 text-[11px]">
                            UPCOMING
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="border-zinc-800 text-zinc-500 py-0.5 text-[11px]">
                            ENDED
                          </Badge>
                        )}

                        <div className="flex items-center gap-1 font-mono text-xs text-zinc-400 bg-zinc-900/80 px-2 py-0.5 rounded border border-zinc-800">
                          <Hash className="h-3 w-3 text-zinc-500" />
                          <span className="font-bold text-zinc-200">{event.pin_code}</span>
                        </div>
                      </div>

                      <CardTitle className="text-base line-clamp-1 text-white">
                        {event.title}
                      </CardTitle>

                      <div className="space-y-1 pt-2 text-xs text-zinc-400 font-mono">
                        <div className="flex items-center gap-1.5">
                          <Clock className="h-3.5 w-3.5 text-zinc-500 shrink-0" />
                          <span>Starts: {formatDate(event.start_time)}</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <Calendar className="h-3.5 w-3.5 text-zinc-500 shrink-0" />
                          <span>Ends: {formatDate(event.end_time)}</span>
                        </div>
                      </div>
                    </CardHeader>

                    <CardContent className="pt-0">
                      <div className="flex items-center justify-between border-t border-zinc-900 pt-3 mt-1 text-xs font-mono">
                        <div className="text-zinc-400">
                          Host: <span className="text-zinc-200">{event.host?.username || "Host"}</span>
                        </div>
                        {event._count?.questions !== undefined && (
                          <div className="text-zinc-500">
                            {event._count.questions} questions
                          </div>
                        )}
                      </div>

                      <div className="grid grid-cols-3 gap-2 pt-3">
                        <Link href={`/events/${event.id}/play`}>
                          <Button size="sm" className="w-full bg-white text-black hover:bg-zinc-200 text-xs font-mono font-bold py-1 px-2">
                            <Play className="h-3 w-3 mr-1 text-emerald-600" />
                            Play
                          </Button>
                        </Link>
                        <Link href={`/events/${event.id}/scoreboard`}>
                          <Button size="sm" variant="outline" className="w-full border-zinc-800 text-zinc-300 text-xs font-mono py-1 px-2">
                            <Trophy className="h-3 w-3 mr-1 text-amber-400" />
                            Scores
                          </Button>
                        </Link>
                        <Link href={`/events/${event.id}/host`}>
                          <Button size="sm" variant="secondary" className="w-full text-zinc-300 text-xs font-mono py-1 px-2">
                            Host
                          </Button>
                        </Link>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
