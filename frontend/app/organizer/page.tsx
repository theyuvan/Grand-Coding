"use client";

import { useCallback, useEffect, useState } from "react";
import { api, type Event, type EventSummary, type TopEvent } from "@/lib/api";
import { useSession } from "@/lib/session";
import { AppShell, Notice, StatusBadge } from "@/components/app/app-shell";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const EMPTY_EVENT = { eventName: "", eventDate: "", capacity: "" };

/** An event plus its checked-in count - Module 5's summary in one row. */
type EventRow = Event & { checkedInCount: number };

/**
 * Organizer side:
 *   Module 1 - Create Event
 *   Module 5 - View Event Summary (the Events table below)
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
      setMessage({ type: "ok", text: `${created.eventName} created for ${created.eventDate}` });
      setTab("events");
      loadAll();
    } catch (error) {
      setMessage({ type: "bad", text: (error as Error).message });
    }
  };

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

        <TabsContent value="events">
          <Card>
            <CardHeader>
              <CardTitle>Event Summary</CardTitle>
              <CardDescription>
                Event Name, Capacity, Registered Count and Checked-In Count.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {rows.length === 0 ? (
                <p className="text-sm text-muted-foreground">No events yet.</p>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Event</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Capacity</TableHead>
                      <TableHead>Registered</TableHead>
                      <TableHead>Checked in</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {rows.map((item) => (
                      <TableRow key={item.eventId}>
                        <TableCell>{item.eventName}</TableCell>
                        <TableCell className="font-mono text-xs">{item.eventDate}</TableCell>
                        <TableCell className="font-mono text-xs">{item.capacity}</TableCell>
                        <TableCell className="font-mono text-xs">{item.registeredCount}</TableCell>
                        <TableCell className="font-mono text-xs">{item.checkedInCount}</TableCell>
                        <TableCell>
                          <StatusBadge value={item.status} />
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="create">
          <Card>
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

        <TabsContent value="top">
          <Card>
            <CardHeader>
              <CardTitle>Highest Registrations</CardTitle>
              <CardDescription>
                Event Name and Total Registrations, highest first.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {topEvents.length === 0 ? (
                <p className="text-sm text-muted-foreground">No registrations yet.</p>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Event</TableHead>
                      <TableHead>Total Registrations</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {topEvents.map((item) => (
                      <TableRow key={item.eventName}>
                        <TableCell>{item.eventName}</TableCell>
                        <TableCell className="font-mono text-xs">{item.totalRegistrations}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </AppShell>
  );
}
