"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import type { Role, User } from "@/lib/api";

const STORAGE_KEY = "eventpass.session";

/**
 * Simulated login - no password and no token is involved. We only remember
 * which USER row the visitor chose to act as.
 */
export function saveSession(user: User) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
}

export function clearSession() {
  localStorage.removeItem(STORAGE_KEY);
}

export function readSession(): User | null {
  if (typeof window === "undefined") return null;
  const raw = localStorage.getItem(STORAGE_KEY);
  return raw ? (JSON.parse(raw) as User) : null;
}

/** Reads the simulated session and sends the visitor back to /login if the role does not match. */
export function useSession(requiredRole: Role) {
  const router = useRouter();
  const [session, setSession] = useState<User | null>(null);

  useEffect(() => {
    const current = readSession();
    if (!current || current.role !== requiredRole) {
      router.replace("/login");
      return;
    }
    setSession(current);
  }, [requiredRole, router]);

  const exit = () => {
    clearSession();
    router.replace("/login");
  };

  return { session, exit };
}
