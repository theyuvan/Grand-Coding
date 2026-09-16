"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import type { User } from "@/lib/api";

export function AppShell({
  session,
  onExit,
  children,
}: {
  session: User;
  onExit: () => void;
  children: ReactNode;
}) {
  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-foreground/10">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 px-6 py-4">
          <Link href="/" className="flex items-center gap-2">
            <span className="font-display text-xl tracking-tight">Event Pass</span>
            <span className="mt-1 font-mono text-xs text-muted-foreground">TM</span>
          </Link>
          <div className="flex items-center gap-3">
            <span className="text-sm text-foreground/70">{session.userName}</span>
            <Badge variant="secondary" className="font-mono">
              {session.role}
            </Badge>
            <Button size="sm" variant="outline" className="rounded-full" onClick={onExit}>
              Exit
            </Button>
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-6xl px-6 py-10">{children}</main>
    </div>
  );
}

export function Notice({ message }: { message: { type: "ok" | "bad"; text: string } | null }) {
  if (!message) return null;
  return (
    <div
      className={`mb-6 rounded-lg border px-4 py-3 text-sm ${
        message.type === "ok"
          ? "border-emerald-600/20 bg-emerald-600/10 text-emerald-700"
          : "border-destructive/20 bg-destructive/10 text-destructive"
      }`}
    >
      {message.text}
    </div>
  );
}

export function StatusBadge({ value }: { value: string }) {
  const good = value === "OPEN" || value === "REGISTERED" || value === "CHECKED_IN";
  return (
    <Badge variant={good ? "secondary" : "outline"} className="font-mono text-[11px]">
      {value.replace("_", " ")}
    </Badge>
  );
}
