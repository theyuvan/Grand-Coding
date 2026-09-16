/** How full an event is - drawn from capacity and the active registration count. */
export function SeatMeter({ filled, capacity }: { filled: number; capacity: number }) {
  const percent = capacity > 0 ? Math.min(100, Math.round((filled / capacity) * 100)) : 0;
  return (
    <div className="h-1.5 w-full overflow-hidden rounded-full bg-foreground/10">
      <div
        className={`h-full rounded-full transition-all duration-500 ${
          percent >= 100 ? "bg-destructive/70" : "bg-foreground"
        }`}
        style={{ width: `${percent}%` }}
      />
    </div>
  );
}

/** One number with its label, used inside the summary cards. */
export function Stat({ label, value }: { label: string; value: number | string }) {
  return (
    <div className="rounded-lg border border-foreground/10 bg-background px-3 py-2 text-center">
      <p className="font-mono text-lg leading-tight">{value}</p>
      <p className="mt-0.5 text-[11px] uppercase tracking-wide text-muted-foreground">{label}</p>
    </div>
  );
}
