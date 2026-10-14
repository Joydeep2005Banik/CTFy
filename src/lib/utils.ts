import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(dateString: string | Date, includeTz: boolean = false) {
  const d = new Date(dateString);
  return d.toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
    ...(includeTz ? { timeZoneName: "short" } : {}),
  });
}

export function formatTimeRemaining(ms: number) {
  if (ms <= 0) return "00:00:00";
  const totalSeconds = Math.floor(ms / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  return [
    hours.toString().padStart(2, "0"),
    minutes.toString().padStart(2, "0"),
    seconds.toString().padStart(2, "0"),
  ].join(":");
}

export function getUnlockedEventIds(): string[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem("ctfy_unlocked_events");
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function markEventUnlocked(eventId: string) {
  if (typeof window === "undefined") return;
  try {
    const list = getUnlockedEventIds();
    if (!list.includes(eventId)) {
      list.push(eventId);
      localStorage.setItem("ctfy_unlocked_events", JSON.stringify(list));
    }
  } catch {}
}

export function isEventUnlocked(eventId: string): boolean {
  return getUnlockedEventIds().includes(eventId);
}

