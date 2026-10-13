"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { KeyRound, ArrowRight, AlertCircle, Shield, Play, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { findEventByPinAction } from "@/lib/actions";
import { INITIAL_MOCK_EVENTS } from "@/lib/mock-data";

export default function JoinEventPage() {
  const router = useRouter();
  const [pin, setPin] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanPin = pin.trim();
    if (!cleanPin) {
      setError("Please enter a competition PIN code.");
      return;
    }

    setError(null);
    setLoading(true);

    try {
      const res = await findEventByPinAction(cleanPin);
      if (!res.success || !res.event) {
        setError(res.error || "Invalid PIN code. Please verify with your host.");
        setLoading(false);
        return;
      }

      // Valid PIN! Navigate to play arena
      router.push(`/events/${res.event.id}/play`);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Error validating PIN.");
      setLoading(false);
    }
  };

  const handleQuickPin = (code: string) => {
    setPin(code);
  };

  return (
    <div className="flex-1 flex items-center justify-center p-4 cyber-grid">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center">
          <div className="inline-flex items-center justify-center h-12 w-12 rounded-xl bg-zinc-900 border border-zinc-800 text-white mb-3 shadow-lg">
            <KeyRound className="h-6 w-6 text-emerald-400" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-white">Join a Competition</h1>
          <p className="text-sm text-zinc-400 mt-1">
            Enter the unique PIN distributed by your CTF host.
          </p>
        </div>

        <Card className="border-zinc-800 bg-zinc-950/80 backdrop-blur-md shadow-2xl">
          <form onSubmit={handleSubmit}>
            <CardHeader className="space-y-1 pb-4">
              <CardTitle className="text-base text-zinc-200">Event Passcode</CardTitle>
              <CardDescription className="text-xs">
                Time-gated challenges will unlock automatically once active.
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-4">
              {error && (
                <div className="p-3 rounded-md bg-red-950/50 border border-red-800 text-red-200 text-xs flex items-center gap-2">
                  <AlertCircle className="h-4 w-4 shrink-0 text-red-400" />
                  <span>{error}</span>
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="pin" className="text-xs font-mono">
                  EVENT PIN CODE
                </Label>
                <Input
                  id="pin"
                  type="text"
                  placeholder="e.g. 482910"
                  value={pin}
                  onChange={(e) => setPin(e.target.value.toUpperCase())}
                  className="bg-zinc-900/80 border-zinc-800 font-mono text-center text-xl tracking-widest uppercase font-bold text-emerald-400 h-12 placeholder:tracking-normal placeholder:font-normal placeholder:text-zinc-600"
                  maxLength={12}
                  autoFocus
                />
              </div>

              <Button
                type="submit"
                disabled={loading || !pin.trim()}
                className="w-full bg-white text-black hover:bg-zinc-200 font-bold h-11 text-sm font-mono"
              >
                {loading ? "Validating Access Code..." : "Enter CTF Arena"}
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>

              {/* Sample PIN shortcuts */}
              <div className="pt-2">
                <div className="relative flex py-2 items-center">
                  <div className="flex-grow border-t border-zinc-800" />
                  <span className="flex-shrink mx-3 text-[11px] font-mono uppercase text-zinc-500">
                    Sample active PINs
                  </span>
                  <div className="flex-grow border-t border-zinc-800" />
                </div>

                <div className="flex flex-wrap gap-2 pt-1 justify-center">
                  {INITIAL_MOCK_EVENTS.map((ev) => (
                    <button
                      key={ev.id}
                      type="button"
                      onClick={() => handleQuickPin(ev.pin_code)}
                      className="px-2.5 py-1 rounded bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-xs font-mono text-zinc-300 transition-colors flex items-center gap-1.5"
                    >
                      <span className="text-zinc-500">{ev.title.slice(0, 14)}…:</span>
                      <strong className="text-white font-bold">{ev.pin_code}</strong>
                    </button>
                  ))}
                </div>
              </div>
            </CardContent>

            <CardFooter className="flex justify-center border-t border-zinc-800/60 pt-4 pb-4">
              <p className="text-xs text-zinc-500 font-mono">
                Looking to host your own CTF?{" "}
                <Link href="/host/create" className="text-zinc-300 hover:text-white underline">
                  Create one now
                </Link>
              </p>
            </CardFooter>
          </form>
        </Card>
      </div>
    </div>
  );
}
