"use client";

import { useCallback, useEffect, useState } from "react";
import { api, type Event, type Registration } from "@/lib/api";
import { formatDate, today } from "@/lib/format";
import { useSession } from "@/lib/session";
import { AppShell, Notice, StatusBadge } from "@/components/app/app-shell";
import { SeatMeter } from "@/components/app/seat-meter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

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

        {/* ---------------- Module 2: register ---------------- */}
        <TabsContent value="events">
          {events.length === 0 ? (
            <p className="text-sm text-muted-foreground">No events available.</p>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {events.map((item) => {
                const mine = activeRegistration(item.eventId);
                const isFull = item.status === "FULL";
                return (
                  <Card
                    key={item.eventId}
                    className="group transition-all duration-300 hover:-translate-y-0.5 hover:border-foreground/25 hover:shadow-md"
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
                      <div>
                        <div className="mb-1.5 flex items-baseline justify-between text-xs">
                          <span className="text-muted-foreground">Seats left</span>
                          <span className="font-mono">
                            {item.availableSeats} of {item.capacity}
                          </span>
                        </div>
                        <SeatMeter filled={item.registeredCount} capacity={item.capacity} />
                      </div>

                      <Button
                        className="w-full rounded-full"
                        disabled={Boolean(mine) || isFull}
                        onClick={() =>
                          run(
                            () => api.register({ studId: session.userId, eventId: item.eventId }),
                            (reg) => `Pass created for ${reg.eventName}`
                          )
                        }
                      >
                        {mine ? "Registered" : isFull ? "Full" : "Register"}
                      </Button>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </TabsContent>

        {/* ------------- Modules 3 and 4: cancel / check in ------------- */}
        <TabsContent value="passes">
          {registrations.length === 0 ? (
            <p className="text-sm text-muted-foreground">No registrations yet.</p>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {registrations.map((item) => {
                const isActive = item.status === "REGISTERED";
                const isCheckedIn = item.checkStatus === "CHECKED_IN";
                const isEventDay = item.eventDate === today();
                const isBeforeEvent = item.eventDate > today();

                return (
                  <Card
                    key={item.regId}
                    className={`transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md ${
                      isActive ? "hover:border-foreground/25" : "opacity-70"
                    }`}
                  >
                    <CardHeader>
                      <div className="flex items-start justify-between gap-3">
                        <CardTitle className="text-base leading-snug">{item.eventName}</CardTitle>
                        <StatusBadge value={item.status} />
                      </div>
                      <p className="font-mono text-xs text-muted-foreground">
                        {formatDate(item.eventDate)} &middot; Reg #{item.regId}
                      </p>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex items-center justify-between border-t border-foreground/10 pt-3 text-xs">
                        <span className="text-muted-foreground">Check-in</span>
                        {isCheckedIn ? (
                          <StatusBadge value="CHECKED_IN" />
                        ) : (
                          <span className="font-mono text-muted-foreground">&mdash;</span>
                        )}
                      </div>

                      {/* Check in: only on the event day */}
                      {isActive && isEventDay && !isCheckedIn && (
                        <Button
                          className="w-full rounded-full"
                          onClick={() =>
                            run(
                              () => api.checkIn({ studId: session.userId, eventId: item.eventId }),
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
                          variant="outline"
                          className="w-full rounded-full"
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

                      {/* Nothing left to do */}
                      {(!isActive || isCheckedIn || (!isEventDay && !isBeforeEvent)) && (
                        <p className="text-center font-mono text-xs text-muted-foreground">
                          {item.status === "CANCELLED"
                            ? "Cancelled"
                            : isCheckedIn
                              ? "Checked in"
                              : "Event over"}
                        </p>
                      )}
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </AppShell>
  );
}
