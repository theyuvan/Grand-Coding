import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function Home() {
  return (
    <main className="min-h-screen bg-background">
      <div className="mx-auto flex min-h-screen max-w-3xl flex-col justify-center px-6 py-16">
        <p className="font-mono text-xs uppercase tracking-widest text-muted-foreground">
          College technical events
        </p>
        <h1 className="mt-4 font-display text-5xl leading-[1.05] tracking-tight sm:text-6xl">
          Event Pass
          <br />
          Management System
        </h1>
        <p className="mt-5 max-w-xl text-muted-foreground">
          Students register for events, receive a pass, and check in on the event day.
          Organizers create the events and watch them fill up.
        </p>

        <div className="mt-12 grid gap-4 sm:grid-cols-2">
          <Card className="transition-all duration-300 hover:-translate-y-0.5 hover:border-foreground/25 hover:shadow-md">
            <CardHeader>
              <CardTitle>Student</CardTitle>
              <CardDescription>
                Register for an event, cancel before the event day, and check in on the day.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button asChild className="w-full rounded-full">
                <Link href="/login?role=STUDENT">Enter as student</Link>
              </Button>
            </CardContent>
          </Card>

          <Card className="transition-all duration-300 hover:-translate-y-0.5 hover:border-foreground/25 hover:shadow-md">
            <CardHeader>
              <CardTitle>Organizer</CardTitle>
              <CardDescription>
                Create an event with a capacity and view the registered and checked-in counts.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button asChild variant="outline" className="w-full rounded-full">
                <Link href="/login?role=ORGANIZER">Enter as organizer</Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </main>
  );
}
