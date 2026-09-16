"use client";

import { useCallback, useEffect, useState } from "react";
import { api, type Event, type Registration } from "@/lib/api";
import { useSession } from "@/lib/session";
import { AppShell, Notice, StatusBadge } from "@/components/app/app-shell";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

/** Local calendar date as YYYY-MM-DD - the same day the backend compares against. */
const today = () => new Date().toLocaleDateString("en-CA");

/**
 * Student side:
 *   Module 2 - Register for Event
 *   Module 3 - Cancel Registration  (only before the event day)
 *   Module 4 - Check-In to Event    (only on the event day)
 */
export default function StudentPage() {
  const { session, exit } = useSession("STUDENT");
  const [events, setEvents] = useState<Event[]>([]);
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [message, setMessage] = useState<{ type: "ok" | "bad"; text: string } | null>(null);

  const loadAll = useCallback(async () => {
    if (!session) return;
    try {
      const [allEvents, myRegistrations] = await Promise.all([
        api.getEvents(),
        api.getStudentRegistrations(session.userId),
      ]);
      setEvents(allEvents);
      setRegistrations(myRegistrations);
    } catch (error) {
      setMessage({ type: "bad", text: (error as Error).message });
    }
  }, [session]);

  useEffect(() => {
    loadAll();
  }, [loadAll]);

  if (!session) return null;

  const run = async <T,>(action: () => Promise<T>, successText: (result: T) => string) => {
    try {
      const result = await action();
      setMessage({ type: "ok", text: successText(result) });
      loadAll();
    } catch (error) {
      setMessage({ type: "bad", text: (error as Error).message });
    }
  };

  const activeRegistration = (eventId: number) =>
    registrations.find((item) => item.eventId === eventId && item.status === "REGISTERED");

  return (
    <AppShell session={session} onExit={exit}>
      <h1 className="font-display text-3xl tracking-tight">Student</h1>

      <Tabs defaultValue="events" className="mt-6">
        <TabsList>
          <TabsTrigger value="events">Events</TabsTrigger>
          <TabsTrigger value="passes">My Passes</TabsTrigger>
        </TabsList>

        <div className="mt-6">
          <Notice message={message} />
        </div>

        <TabsContent value="events">
          <Card>
            <CardHeader>
              <CardTitle>Events</CardTitle>
              <CardDescription>Register once per event. A full event is blocked.</CardDescription>
            </CardHeader>
            <CardContent>
              {events.length === 0 ? (
                <p className="text-sm text-muted-foreground">No events available.</p>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Event</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Seats left</TableHead>
                      <TableHead />
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {events.map((item) => {
                      const mine = activeRegistration(item.eventId);
                      return (
                        <TableRow key={item.eventId}>
                          <TableCell>{item.eventName}</TableCell>
                          <TableCell className="font-mono text-xs">{item.eventDate}</TableCell>
                          <TableCell className="font-mono text-xs">
                            {item.availableSeats} of {item.capacity}
                          </TableCell>
                          <TableCell className="text-right">
                            <Button
                              size="sm"
                              className="rounded-full"
                              disabled={Boolean(mine) || item.status === "FULL"}
                              onClick={() =>
                                run(
                                  () =>
                                    api.register({
                                      studId: session.userId,
                                      eventId: item.eventId,
                                    }),
                                  (reg) => `Pass created for ${reg.eventName}`
                                )
                              }
                            >
                              {mine ? "Registered" : item.status === "FULL" ? "Full" : "Register"}
                            </Button>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="passes">
          <Card>
            <CardHeader>
              <CardTitle>My Passes</CardTitle>
              <CardDescription>
                Cancel shows before the event day. Check in shows on the event day.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {registrations.length === 0 ? (
                <p className="text-sm text-muted-foreground">No registrations yet.</p>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Event</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Check-in</TableHead>
                      <TableHead />
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {registrations.map((item) => {
                      const isActive = item.status === "REGISTERED";
                      const isCheckedIn = item.checkStatus === "CHECKED_IN";
                      const isEventDay = item.eventDate === today();
                      const isBeforeEvent = item.eventDate > today();

                      return (
                        <TableRow key={item.regId}>
                          <TableCell>{item.eventName}</TableCell>
                          <TableCell className="font-mono text-xs">{item.eventDate}</TableCell>
                          <TableCell>
                            <StatusBadge value={item.status} />
                          </TableCell>
                          <TableCell>
                            {isCheckedIn ? (
                              <StatusBadge value="CHECKED_IN" />
                            ) : (
                              <span className="font-mono text-xs text-muted-foreground">&mdash;</span>
                            )}
                          </TableCell>
                          <TableCell className="text-right">
                            {/* Check in: only on the event day */}
                            {isActive && isEventDay && !isCheckedIn && (
                              <Button
                                size="sm"
                                className="rounded-full"
                                onClick={() =>
                                  run(
                                    () =>
                                      api.checkIn({
                                        studId: session.userId,
                                        eventId: item.eventId,
                                      }),
                                    (checkIn) => `Checked in to ${checkIn.eventName}`
                                  )
                                }
                              >
                                Check in
                              </Button>
                            )}

                            {/* Cancel: only before the event day */}
                            {isActive && isBeforeEvent && (
                              <Button
                                size="sm"
                                variant="outline"
                                className="rounded-full"
                                onClick={() =>
                                  run(
                                    () => api.cancelRegistration(item.regId),
                                    (reg) => `Registration for ${reg.eventName} cancelled`
                                  )
                                }
                              >
                                Cancel
                              </Button>
                            )}

                            {/* Nothing to do: cancelled, already checked in, or the event is over */}
                            {(!isActive || isCheckedIn || (!isEventDay && !isBeforeEvent)) && (
                              <span className="font-mono text-xs text-muted-foreground">&mdash;</span>
                            )}
                          </TableCell>
                        </TableRow>
                      );
                    })}
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
