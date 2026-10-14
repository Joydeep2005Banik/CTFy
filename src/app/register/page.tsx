"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Flag, Lock, Mail, User, ArrowRight, AlertCircle, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { createClient, isSupabaseConfigured } from "@/lib/supabase/client";

const registerSchema = z
  .object({
    username: z
      .string()
      .min(3, "Username must be at least 3 characters")
      .max(20, "Username cannot exceed 20 characters")
      .regex(/^[a-zA-Z0-9_-]+$/, "Letters, numbers, underscores, and hyphens only"),
    email: z.string().email("Please enter a valid email address"),
    password: z.string().min(6, "Password must be at least 6 characters"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

type RegisterFormValues = z.infer<typeof registerSchema>;

export default function RegisterPage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      username: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
  });

  const onSubmit = async (values: RegisterFormValues) => {
    setError(null);
    setLoading(true);

    try {
      if (!isSupabaseConfigured()) {
        // Fallback Demo Auth
        const demoUser = {
          id: `user-${Date.now()}`,
          username: values.username,
          email: values.email,
        };
        localStorage.setItem("ctfy_demo_user", JSON.stringify(demoUser));
        window.location.href = "/dashboard";
        return;
      }

      const supabase = createClient();
      const redirectUrl =
        typeof window !== "undefined"
          ? `${window.location.origin}/dashboard`
          : undefined;

      const { data, error: signUpError } = await supabase.auth.signUp({
        email: values.email,
        password: values.password,
        options: {
          data: {
            username: values.username,
          },
          emailRedirectTo: redirectUrl,
        },
      });

      if (signUpError) {
        setError(signUpError.message);
        setLoading(false);
        return;
      }

      // Check if session immediately granted or email confirmation required
      if (data.session) {
        router.push("/dashboard");
      } else {
        setSuccessMsg(
          "Registration successful! Please check your email to confirm your account, or sign in."
        );
        setLoading(false);
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "An unexpected error occurred.";
      setError(message);
      setLoading(false);
    }
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
          <h1 className="text-2xl font-bold tracking-tight text-white">Create an Account</h1>
          <p className="text-sm text-zinc-400 mt-1">Join competitions or host your own in seconds</p>
        </div>

        <Card className="border-zinc-800 bg-zinc-950/80 backdrop-blur-md shadow-2xl">
          <form onSubmit={handleSubmit(onSubmit)}>
            <CardHeader className="space-y-1 pb-4">
              <CardTitle className="text-base text-zinc-200">Registration</CardTitle>
              <CardDescription className="text-xs">
                Pick a unique hacker handle for the scoreboards
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-4">
              {error && (
                <div className="p-3 rounded-md bg-red-950/50 border border-red-800/80 text-red-200 text-xs flex items-center gap-2">
                  <AlertCircle className="h-4 w-4 shrink-0 text-red-400" />
                  <span>{error}</span>
                </div>
              )}

              {successMsg && (
                <div className="p-3 rounded-md bg-emerald-950/50 border border-emerald-800/80 text-emerald-200 text-xs flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-400" />
                  <span>{successMsg}</span>
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="username" className="text-xs font-mono">HANDLE / USERNAME</Label>
                <div className="relative">
                  <User className="absolute left-3 top-3 h-4 w-4 text-zinc-500" />
                  <Input
                    id="username"
                    placeholder="cypher_rebel"
                    className="pl-9 bg-zinc-900/80 border-zinc-800 font-mono text-sm"
                    {...register("username")}
                  />
                </div>
                {errors.username && (
                  <p className="text-xs text-red-400">{errors.username.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="email" className="text-xs font-mono">EMAIL ADDRESS</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-zinc-500" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="rebel@matrix.org"
                    className="pl-9 bg-zinc-900/80 border-zinc-800"
                    {...register("email")}
                  />
                </div>
                {errors.email && (
                  <p className="text-xs text-red-400">{errors.email.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="text-xs font-mono">PASSWORD</Label>
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

              <div className="space-y-2">
                <Label htmlFor="confirmPassword" className="text-xs font-mono">CONFIRM PASSWORD</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-zinc-500" />
                  <Input
                    id="confirmPassword"
                    type="password"
                    placeholder="••••••••••••"
                    className="pl-9 bg-zinc-900/80 border-zinc-800"
                    {...register("confirmPassword")}
                  />
                </div>
                {errors.confirmPassword && (
                  <p className="text-xs text-red-400">{errors.confirmPassword.message}</p>
                )}
              </div>

              <Button
                type="submit"
                disabled={loading}
                className="w-full bg-white text-black hover:bg-zinc-200 font-semibold h-10 mt-2"
              >
                {loading ? "Creating Account..." : "Create Account"}
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </CardContent>

            <CardFooter className="flex justify-center border-t border-zinc-800/60 pt-4 pb-4">
              <p className="text-xs text-zinc-400">
                Already have an account?{" "}
                <Link href="/login" className="text-white underline-offset-4 hover:underline font-semibold">
                  Sign in instead
                </Link>
              </p>
            </CardFooter>
          </form>
        </Card>
      </div>
    </div>
  );
}
