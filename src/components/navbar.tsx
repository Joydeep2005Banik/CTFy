"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Flag, Shield, LogOut, PlusCircle, KeyRound, Terminal } from "lucide-react";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { createClient, isSupabaseConfigured } from "@/lib/supabase/client";
import { DEMO_USER } from "@/lib/mock-data";

export function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const [user, setUser] = useState<{ email?: string; username?: string; id?: string } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function checkAuth() {
      if (!isSupabaseConfigured()) {
        // Fallback demo user
        const demoStored = localStorage.getItem("ctfy_demo_user");
        if (demoStored) {
          try {
            setUser(JSON.parse(demoStored));
          } catch {
            setUser({ id: DEMO_USER.id, username: DEMO_USER.username, email: "pilot@ctfy.dev" });
          }
        } else {
          setUser({ id: DEMO_USER.id, username: DEMO_USER.username, email: "pilot@ctfy.dev" });
        }
        setLoading(false);
        return;
      }

      const supabase = createClient();
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (session?.user) {
        // Get username from profiles
        const { data: profile } = await supabase
          .from("profiles")
          .select("username")
          .eq("id", session.user.id)
          .single();

        setUser({
          id: session.user.id,
          email: session.user.email,
          username: profile?.username || session.user.email?.split("@")[0] || "operator",
        });
      } else {
        setUser(null);
      }
      setLoading(false);
    }

    checkAuth();
  }, [pathname]);

  const handleSignOut = async () => {
    if (!isSupabaseConfigured()) {
      localStorage.removeItem("ctfy_demo_user");
    } else {
      const supabase = createClient();
      await supabase.auth.signOut();
    }
    setUser(null);
    window.location.href = "/login";
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b border-zinc-800/80 bg-zinc-950/80 backdrop-blur-md">
      <div className="container mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
        {/* Brand */}
        <div className="flex items-center gap-6">
          <Link
            href="/"
            className="flex items-center gap-2.5 font-mono text-lg font-bold tracking-tight text-white hover:opacity-90 transition-opacity"
          >
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white text-black shadow-md">
              <Flag className="h-4 w-4 fill-black" />
            </div>
            <span className="text-xl tracking-tighter font-extrabold">CTFy</span>
            <Badge variant="outline" className="hidden sm:inline-flex text-[10px] uppercase font-mono border-zinc-800 text-zinc-400">
              LIGHTWEIGHT
            </Badge>
          </Link>

          {/* Navigation links */}
          <nav className="hidden md:flex items-center gap-1 text-sm font-medium">
            <Link
              href="/dashboard"
              className={`px-3 py-1.5 rounded-md transition-colors ${
                pathname === "/dashboard"
                  ? "bg-zinc-900 text-white font-semibold"
                  : "text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900/50"
              }`}
            >
              Dashboard
            </Link>
            <Link
              href="/join"
              className={`px-3 py-1.5 rounded-md transition-colors flex items-center gap-1.5 ${
                pathname === "/join"
                  ? "bg-zinc-900 text-white font-semibold"
                  : "text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900/50"
              }`}
            >
              <KeyRound className="h-3.5 w-3.5" />
              Join CTF
            </Link>
            <Link
              href="/host/create"
              className={`px-3 py-1.5 rounded-md transition-colors flex items-center gap-1.5 ${
                pathname === "/host/create"
                  ? "bg-zinc-900 text-white font-semibold"
                  : "text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900/50"
              }`}
            >
              <PlusCircle className="h-3.5 w-3.5" />
              Host CTF
            </Link>
          </nav>
        </div>

        {/* Right action buttons / user profile */}
        <div className="flex items-center gap-3">
          {!loading && user ? (
            <div className="flex items-center gap-3">
              <div className="hidden sm:flex items-center gap-2 px-2.5 py-1 rounded-full border border-zinc-800 bg-zinc-900/60 font-mono text-xs">
                <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-zinc-300 font-semibold">{user.username}</span>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={handleSignOut}
                className="text-zinc-400 hover:text-white border-zinc-800"
              >
                <LogOut className="h-3.5 w-3.5 sm:mr-1.5" />
                <span className="hidden sm:inline">Sign Out</span>
              </Button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link href="/login">
                <Button variant="ghost" size="sm" className="text-zinc-300 hover:text-white">
                  Sign In
                </Button>
              </Link>
              <Link href="/register">
                <Button size="sm" className="bg-white text-black hover:bg-zinc-200 font-semibold">
                  Get Started
                </Button>
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
