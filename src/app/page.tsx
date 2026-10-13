import Link from "next/link";
import { Flag, ShieldCheck, Zap, Users, ArrowRight, Play, Sparkles, Terminal, Trophy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { INITIAL_MOCK_EVENTS } from "@/lib/mock-data";

export default function HomePage() {
  const activeEvent = INITIAL_MOCK_EVENTS[0];

  return (
    <div className="flex-1 flex flex-col justify-center cyber-grid">
      {/* Hero Section */}
      <section className="relative overflow-hidden py-16 md:py-24 border-b border-zinc-800/80">
        <div className="container mx-auto px-4 sm:px-6 max-w-6xl">
          <div className="max-w-3xl mx-auto text-center space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-zinc-800 bg-zinc-900/80 backdrop-blur-sm text-xs font-mono text-zinc-300">
              <span className="flex h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>Next-Gen Minimalist CTF Engine</span>
            </div>

            <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-white leading-tight">
              Capture The Flag. <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-zinc-200 via-zinc-400 to-zinc-600">
                Without the Container Overhead.
              </span>
            </h1>

            <p className="text-lg sm:text-xl text-zinc-400 leading-relaxed max-w-2xl mx-auto">
              <strong>CTFy</strong> is a lightning-fast platform for hosting and competing in targeted
              cybersecurity CTFs. Google Forms simplicity for organizers, real-time live scoreboards for competitors, zero terminal maintenance.
            </p>

            {/* Primary Action Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-4">
              <Link href="/register" className="w-full sm:w-auto">
                <Button size="lg" className="w-full sm:w-auto bg-white text-black hover:bg-zinc-200 font-semibold px-8 h-12 text-base">
                  Get Started Free
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
              <Link href="/login" className="w-full sm:w-auto">
                <Button size="lg" variant="outline" className="w-full sm:w-auto border-zinc-700 hover:border-zinc-500 h-12 text-base text-zinc-300">
                  Sign In
                </Button>
              </Link>
              <Link href="/join" className="w-full sm:w-auto">
                <Button size="lg" variant="cyber" className="w-full sm:w-auto h-12 text-base">
                  <Play className="mr-2 h-4 w-4 text-emerald-400" />
                  Enter Event PIN
                </Button>
              </Link>
            </div>
          </div>

          {/* Quick interactive test drive card */}
          {activeEvent && (
            <div className="mt-14 max-w-2xl mx-auto">
              <Card className="border-zinc-800 bg-zinc-950/80 backdrop-blur-md shadow-2xl relative overflow-hidden">
                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-emerald-500 via-zinc-400 to-emerald-500" />
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <Badge variant="success" className="gap-1.5 py-1">
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-ping" />
                      LIVE COMPETITION READY
                    </Badge>
                    <span className="font-mono text-xs text-zinc-400">PIN: <strong className="text-white text-sm tracking-wider font-bold">{activeEvent.pin_code}</strong></span>
                  </div>
                  <CardTitle className="text-xl mt-2">{activeEvent.title}</CardTitle>
                  <CardDescription>
                    Test drive the platform right now without any setup! Try decoding flags and submitting answers.
                  </CardDescription>
                </CardHeader>
                <CardContent className="pt-0 flex flex-wrap gap-2.5">
                  <Link href={`/events/${activeEvent.id}/play`}>
                    <Button size="sm" className="bg-emerald-600 hover:bg-emerald-500 text-white font-mono text-xs">
                      <Play className="h-3.5 w-3.5 mr-1.5" />
                      Play As Competitor
                    </Button>
                  </Link>
                  <Link href={`/events/${activeEvent.id}/scoreboard`}>
                    <Button size="sm" variant="outline" className="border-zinc-700 text-xs font-mono">
                      <Trophy className="h-3.5 w-3.5 mr-1.5 text-amber-400" />
                      Live Scoreboard
                    </Button>
                  </Link>
                  <Link href={`/events/${activeEvent.id}/host`}>
                    <Button size="sm" variant="secondary" className="text-xs font-mono">
                      Host View & Submissions
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </section>

      {/* Feature Pillars */}
      <section className="py-16 md:py-20 bg-zinc-950/40">
        <div className="container mx-auto px-4 sm:px-6 max-w-6xl">
          <div className="text-center max-w-xl mx-auto mb-12 space-y-2">
            <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
              Designed for Velocity & Focus
            </h2>
            <p className="text-zinc-400 text-sm">
              Everything you need for student clubs, hiring challenges, and security workshops.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="border-zinc-800/80 bg-zinc-900/30 hover:border-zinc-700 transition-colors">
              <CardHeader>
                <div className="h-10 w-10 rounded-lg bg-zinc-800 flex items-center justify-center mb-2 border border-zinc-700">
                  <Terminal className="h-5 w-5 text-white" />
                </div>
                <CardTitle className="text-lg">Zero Terminal Hassle</CardTitle>
                <CardDescription>
                  Forget flaky SSH shells and hung Docker containers. Pure flag submission with instant server verification.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-zinc-800/80 bg-zinc-900/30 hover:border-zinc-700 transition-colors">
              <CardHeader>
                <div className="h-10 w-10 rounded-lg bg-zinc-800 flex items-center justify-center mb-2 border border-zinc-700">
                  <Zap className="h-5 w-5 text-emerald-400" />
                </div>
                <CardTitle className="text-lg">Form-Style Question Builder</CardTitle>
                <CardDescription>
                  Create CTF rounds as easily as a Google Form. Paste challenge prompts, external asset URLs, flags, and point weights.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-zinc-800/80 bg-zinc-900/30 hover:border-zinc-700 transition-colors">
              <CardHeader>
                <div className="h-10 w-10 rounded-lg bg-zinc-800 flex items-center justify-center mb-2 border border-zinc-700">
                  <Trophy className="h-5 w-5 text-amber-400" />
                </div>
                <CardTitle className="text-lg">Realtime Scoreboard</CardTitle>
                <CardDescription>
                  Powered by Supabase Realtime. Standings shuffle instantly as participants crack challenges. Zero page refreshes.
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      </section>
    </div>
  );
}
