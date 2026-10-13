"use client";

import { useState, useEffect } from "react";
import { isSupabaseConfigured } from "@/lib/supabase/client";
import { Database, X, Sparkles, ExternalLink } from "lucide-react";

export function SupabaseBanner() {
  const [configured, setConfigured] = useState(true);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    setConfigured(isSupabaseConfigured());
  }, []);

  if (configured || dismissed) return null;

  return (
    <div className="bg-zinc-900 border-b border-zinc-800 text-xs py-2 px-4 text-zinc-300">
      <div className="container mx-auto max-w-6xl flex items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <span className="flex h-2 w-2 rounded-full bg-amber-400 animate-ping" />
          <Database className="h-3.5 w-3.5 text-amber-400 shrink-0" />
          <span>
            <strong className="text-white font-medium">Interactive Demo Mode Active:</strong>{" "}
            Supabase keys not yet plugged in. Submissions & events are simulated with instant local state.
            To connect live Supabase, add credentials to <code className="text-zinc-200 bg-zinc-800 px-1 py-0.5 rounded font-mono">.env.local</code>.
          </span>
        </div>
        <button
          onClick={() => setDismissed(true)}
          className="text-zinc-500 hover:text-zinc-200 transition-colors p-1"
          aria-label="Dismiss banner"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  );
}
