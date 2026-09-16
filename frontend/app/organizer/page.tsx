"use client";

import { useCallback, useEffect, useState } from "react";
import { api, type Event, type EventSummary, type TopEvent } from "@/lib/api";
import { formatDate } from "@/lib/format";
import { useSession } from "@/lib/session";
import { AppShell, Notice, StatusBadge } from "@/components/app/app-shell";
import { SeatMeter, Stat } from "@/components/app/seat-meter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const EMPTY_EVENT = { eventName: "", eventDate: "", capacity: "" };

/** An event plus its checked-in count - Module 5's summary in one card. */
type EventRow = Event & { checkedInCount: number };

/**
 * Organizer side:
 *   Module 1 - Create Event
 *   Module 5 - View Event Summary (the cards below)
 *   SQL Task  - Events with the highest registrations
 */
export default function OrganizerPage() {
  const { session, exit } = useSession("ORGANIZER");
  const [rows, setRows] = useState<EventRow[]>([]);
  const [topEvents, setTopEvents] = useState<TopEvent[]>([]);
  const [form, setForm] = useState(EMPTY_EVENT);
  const [tab, setTab] = useState("events");
  const [message, setMessage] = useState<{ type: "ok" | "bad"; text: string } | null>(null);

  const loadAll = useCallback(async () => {
    if (!session) return;
    try {
      const [events, summaries, top] = await Promise.all([
        api.getEvents(),
        api.getSummaries(),
        api.getTopEvents(),
      ]);
      const checkedIn = new Map(summaries.map((s: EventSummary) => [s.eventId, s.checkedInCount]));
      setRows(events.map((event) => ({ ...event, checkedInCount: checkedIn.get(event.eventId) ?? 0 })));
      setTopEvents(top);
    } catch (error) {
      setMessage({ type: "bad", text: (error as Error).message });
    }
  }, [session]);

  useEffect(() => {
    loadAll();
  }, [loadAll]);

  if (!session) return null;

  const createEvent = async (event: React.FormEvent) => {
    event.preventDefault();
    try {
      const created = await api.createEvent({
        organizerId: session.userId,
        eventName: form.eventName,
        eventDate: form.eventDate,
        capacity: Number(form.capacity),
      });
      setForm(EMPTY_EVENT);
      setMessage({ type: "ok", text: `${created.eventName} created for ${formatDate(created.eventDate)}` });
      setTab("events");
      loadAll();
    } catch (error) {
      setMessage({ type: "bad", text: (error as Error).message });
    }
  };

  const mostRegistrations = topEvents.length > 0 ? topEvents[0].totalRegistrations : 0;

  return (
    <AppShell session={session} onExit={exit}>
      <h1 className="font-display text-3xl tracking-tight">Organizer</h1>

      <Tabs value={tab} onValueChange={setTab} className="mt-6">
        <TabsList>
          <TabsTrigger value="events">Event Summary</TabsTrigger>
          <TabsTrigger value="create">Create Event</TabsTrigger>
          <TabsTrigger value="top">Highest Registrations</TabsTrigger>
        </TabsList>

        <div className="mt-6">
          <Notice message={message} />
        </div>

        {/* ---------------- Module 5: summary ---------------- */}
        <TabsContent value="events">
          {rows.length === 0 ? (
            <p className="text-sm text-muted-foreground">No events yet.</p>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {rows.map((item) => (
                <Card
                  key={item.eventId}
                  className="transition-all duration-300 hover:-translate-y-0.5 hover:border-foreground/25 hover:shadow-md"
                >
                  <CardHeader>
                    <div className="flex items-start justify-between gap-3">
                      <CardTitle className="text-base leading-snug">{item.eventName}</CardTitle>
                      <StatusBadge value={item.status} />
                    </div>
                    <p className="font-mono text-xs text-muted-foreground">
                      {formatDate(item.eventDate)}
                    </p>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-3 gap-2">
                      <Stat label="Capacity" value={item.capacity} />
                      <Stat label="Registered" value={item.registeredCount} />
                      <Stat label="Checked in" value={item.checkedInCount} />
                    </div>
                    <SeatMeter filled={item.registeredCount} capacity={item.capacity} />
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        {/* ---------------- Module 1: create ---------------- */}
        <TabsContent value="create">
          <Card className="max-w-2xl">
            <CardHeader>
              <CardTitle>Create Event</CardTitle>
              <CardDescription>
                Event Name, Event Date and Maximum Capacity. A new event starts Open.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={createEvent} className="space-y-4">
                <div className="grid gap-4 sm:grid-cols-3">
                  <div className="space-y-2">
                    <Label htmlFor="eventName">Event name</Label>
                    <Input
                      id="eventName"
                      value={form.eventName}
                      onChange={(e) => setForm({ ...form, eventName: e.target.value })}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="eventDate">Event date</Label>
                    <Input
                      id="eventDate"
                      type="date"
                      value={form.eventDate}
                      onChange={(e) => setForm({ ...form, eventDate: e.target.value })}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="capacity">Maximum capacity</Label>
                    <Input
                      id="capacity"
                      type="number"
                      min={1}
                      value={form.capacity}
                      onChange={(e) => setForm({ ...form, capacity: e.target.value })}
                      required
                    />
                  </div>
                </div>
                <Button type="submit" className="rounded-full">
                  Create event
                </Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ---------------- SQL task ---------------- */}
        <TabsContent value="top">
          {topEvents.length === 0 ? (
            <p className="text-sm text-muted-foreground">No registrations yet.</p>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {topEvents.map((item, index) => (
                <Card
                  key={item.eventName}
                  className="transition-all duration-300 hover:-translate-y-0.5 hover:border-foreground/25 hover:shadow-md"
                >
                  <CardHeader>
                    <div className="flex items-start justify-between gap-3">
                      <CardTitle className="text-base leading-snug">{item.eventName}</CardTitle>
                      <span className="font-mono text-xs text-muted-foreground">#{index + 1}</span>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex items-baseline gap-2">
                      <span className="font-mono text-3xl leading-none">{item.totalRegistrations}</span>
                      <span className="text-xs text-muted-foreground">total registrations</span>
                    </div>
                    <SeatMeter filled={item.totalRegistrations} capacity={mostRegistrations} />
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </AppShell>
  );
}
