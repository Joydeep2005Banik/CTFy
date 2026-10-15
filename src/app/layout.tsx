import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Suspense } from "react";
import { Navbar } from "@/components/navbar";
import { SupabaseBanner } from "@/components/supabase-banner";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "CTFy — Lightweight Capture The Flag Platform",
  description:
    "A fast, lightweight platform for hosting and participating in targeted CTF competitions without container or terminal overhead.",
  keywords: ["CTF", "Capture The Flag", "Cybersecurity", "Hackathon", "Quiz", "Flags"],
  authors: [{ name: "CTFy Team" }],
  openGraph: {
    title: "CTFy — Lightweight Capture The Flag Platform",
    description: "Host & play CTFs in seconds with zero terminal overhead.",
    siteName: "CTFy",
    type: "website",
  },
  icons: {
    icon: [
      { url: "/icon.svg", type: "image/svg+xml" },
      { url: "/favicon.ico", sizes: "any" },
    ],
    apple: "/apple-icon.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} dark h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-[#09090b] text-zinc-100 font-sans selection:bg-zinc-800 selection:text-white">
        <SupabaseBanner />
        <Suspense fallback={<div className="h-16 border-b border-zinc-800/80 bg-zinc-950/80" />}>
          <Navbar />
        </Suspense>
        <main className="flex-1 flex flex-col">{children}</main>
        <footer className="border-t border-zinc-900 bg-zinc-950/60 py-6 text-center text-xs text-zinc-500 font-mono">
          <div className="container mx-auto px-4 max-w-6xl flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <span className="font-bold text-zinc-400">CTFy</span>
              <span>— Minimalist, Fast, Flag-Based Competitions</span>
            </div>
            <div className="text-zinc-600">
              No terminals. Pure flags. Built with Next.js & Supabase.
            </div>
          </div>
        </footer>
      </body>
    </html>
  );
}
