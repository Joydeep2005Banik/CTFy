"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Flag, Lock, Mail, ArrowRight, AlertCircle, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { createClient, isSupabaseConfigured } from "@/lib/supabase/client";
import { DEMO_USER } from "@/lib/mock-data";

const loginSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = async (values: LoginFormValues) => {
    setError(null);
    setLoading(true);

    try {
      if (!isSupabaseConfigured()) {
        // Fallback Demo Auth
        const demoUser = {
          id: DEMO_USER.id,
          username: values.email.split("@")[0] || DEMO_USER.username,
          email: values.email,
        };
        localStorage.setItem("ctfy_demo_user", JSON.stringify(demoUser));
        router.push("/dashboard");
        return;
      }

      const supabase = createClient();
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: values.email,
        password: values.password,
      });

      if (signInError) {
        setError(signInError.message);
        setLoading(false);
        return;
      }

      router.push("/dashboard");
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "An unexpected error occurred.";
      setError(message);
      setLoading(false);
    }
  };

  const handleDemoLogin = () => {
    localStorage.setItem(
      "ctfy_demo_user",
      JSON.stringify({
        id: DEMO_USER.id,
        username: DEMO_USER.username,
        email: "demo@ctfy.dev",
      })
    );
    router.push("/dashboard");
  };

  return (
    <div className="flex-1 flex items-center justify-center p-4 cyber-grid">
      <div className="w-full max-w-md">
        <div className="text-center mb-6">
          <Link href="/" className="inline-flex items-center gap-2 font-mono text-xl font-bold text-white mb-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white text-black">
              <Flag className="h-4 w-4 fill-black" />
            </div>
            <span>CTFy</span>
          </Link>
          <h1 className="text-2xl font-bold tracking-tight text-white">Sign In to CTFy</h1>
          <p className="text-sm text-zinc-400 mt-1">Enter your credentials to access your competitions</p>
        </div>

        <Card className="border-zinc-800 bg-zinc-950/80 backdrop-blur-md shadow-2xl">
          <form onSubmit={handleSubmit(onSubmit)}>
            <CardHeader className="space-y-1 pb-4">
              <CardTitle className="text-base text-zinc-200">Account Login</CardTitle>
              <CardDescription className="text-xs">
                Use your registered email & password
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-4">
              {error && (
                <div className="p-3 rounded-md bg-red-950/50 border border-red-800/80 text-red-200 text-xs flex items-center gap-2">
                  <AlertCircle className="h-4 w-4 shrink-0 text-red-400" />
                  <span>{error}</span>
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="email" className="text-xs font-mono">EMAIL ADDRESS</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-zinc-500" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="hacker@defcon.org"
                    className="pl-9 bg-zinc-900/80 border-zinc-800"
                    {...register("email")}
                  />
                </div>
                {errors.email && (
                  <p className="text-xs text-red-400">{errors.email.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password" className="text-xs font-mono">PASSWORD</Label>
                </div>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-zinc-500" />
                  <Input
                    id="password"
                    type="password"
                    placeholder="••••••••••••"
                    className="pl-9 bg-zinc-900/80 border-zinc-800"
                    {...register("password")}
                  />
                </div>
                {errors.password && (
                  <p className="text-xs text-red-400">{errors.password.message}</p>
                )}
              </div>

              <Button
                type="submit"
                disabled={loading}
                className="w-full bg-white text-black hover:bg-zinc-200 font-semibold h-10 mt-2"
              >
                {loading ? "Authenticating..." : "Sign In"}
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>

              {/* Instant 1-click Demo Account option */}
              <div className="pt-2">
                <div className="relative flex py-2 items-center">
                  <div className="flex-grow border-t border-zinc-800" />
                  <span className="flex-shrink mx-3 text-[11px] font-mono uppercase text-zinc-500">
                    Quick test access
                  </span>
                  <div className="flex-grow border-t border-zinc-800" />
                </div>

                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleDemoLogin}
                  className="w-full border-zinc-800 hover:border-zinc-700 text-zinc-300 font-mono text-xs h-9"
                >
                  <Shield className="h-3.5 w-3.5 mr-2 text-emerald-400" />
                  Continue as Demo Pilot (1-Click)
                </Button>
              </div>
            </CardContent>

            <CardFooter className="flex justify-center border-t border-zinc-800/60 pt-4 pb-4">
              <p className="text-xs text-zinc-400">
                Don&apos;t have an account?{" "}
                <Link href="/register" className="text-white underline-offset-4 hover:underline font-semibold">
                  Register here
                </Link>
              </p>
            </CardFooter>
          </form>
        </Card>
      </div>
    </div>
  );
}
