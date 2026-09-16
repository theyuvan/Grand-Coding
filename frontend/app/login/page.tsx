"use client";

import { Suspense, useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { api, type Role, type User } from "@/lib/api";
import { saveSession } from "@/lib/session";
import { Notice } from "@/components/app/app-shell";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const EMPTY_USER = { userName: "", email: "", phoneNo: "", college: "" };

export default function LoginPage() {
  return (
    <Suspense>
      <SimulatedLogin />
    </Suspense>
  );
}

/**
 * Simulated login: there is no password anywhere in the ER, so entering the
 * app means picking the USER row you want to act as. The role is already
 * decided on the landing page and arrives as ?role=STUDENT / ?role=ORGANIZER.
 */
function SimulatedLogin() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const role: Role = searchParams.get("role") === "ORGANIZER" ? "ORGANIZER" : "STUDENT";
  const label = role === "STUDENT" ? "student" : "organizer";

  const [users, setUsers] = useState<User[]>([]);
  const [form, setForm] = useState(EMPTY_USER);
  const [message, setMessage] = useState<{ type: "ok" | "bad"; text: string } | null>(null);

  const loadUsers = useCallback(async () => {
    try {
      setUsers(await api.getUsers(role));
    } catch (error) {
      setMessage({ type: "bad", text: (error as Error).message });
    }
  }, [role]);

  useEffect(() => {
    loadUsers();
  }, [loadUsers]);

  const enterAs = (user: User) => {
    saveSession(user);
    router.push(user.role === "ORGANIZER" ? "/organizer" : "/student");
  };

  const addUser = async (event: React.FormEvent) => {
    event.preventDefault();
    try {
      const created = await api.createUser({ ...form, role });
      setForm(EMPTY_USER);
      setMessage({ type: "ok", text: `${created.userName} added as ${created.role}` });
      loadUsers();
    } catch (error) {
      setMessage({ type: "bad", text: (error as Error).message });
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-3xl px-6 py-16">
        <Link href="/" className="font-mono text-xs text-muted-foreground hover:text-foreground">
          &larr; Back
        </Link>

        <h1 className="mt-6 font-display text-4xl tracking-tight">
          {role === "STUDENT" ? "Student login" : "Organizer login"}
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Choose your ID to continue. No password is used - this is a simulated login.
        </p>

        <div className="mt-8">
          <Notice message={message} />
        </div>

        {users.length === 0 ? (
          <p className="text-sm text-muted-foreground">No {label} found. Add one below.</p>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2">
            {users.map((user) => (
              <Card
                key={user.userId}
                role="button"
                tabIndex={0}
                onClick={() => enterAs(user)}
                onKeyDown={(event) => {
                  if (event.key === "Enter" || event.key === " ") enterAs(user);
                }}
                className="cursor-pointer transition-all duration-300 hover:-translate-y-0.5 hover:border-foreground/25 hover:shadow-md focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
              >
                <CardHeader>
                  <div className="flex items-start justify-between gap-3">
                    <CardTitle className="text-base leading-snug">{user.userName}</CardTitle>
                    <span className="font-mono text-xs text-muted-foreground">
                      ID {user.userId}
                    </span>
                  </div>
                  <CardDescription className="font-mono text-xs">{user.email}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="space-y-1 font-mono text-xs text-muted-foreground">
                    {user.college && <p>{user.college}</p>}
                    {user.phoneNo && <p>{user.phoneNo}</p>}
                  </div>
                  <Button size="sm" className="w-full rounded-full" tabIndex={-1}>
                    Continue
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        <Card className="mt-8">
          <CardHeader>
            <CardTitle>Add a new {label}</CardTitle>
            <CardDescription>
              Creates a USER row: user name, role, email, phone no and college.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={addUser} className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="userName">User name</Label>
                  <Input
                    id="userName"
                    value={form.userName}
                    onChange={(e) => setForm({ ...form, userName: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phoneNo">Phone no</Label>
                  <Input
                    id="phoneNo"
                    value={form.phoneNo}
                    onChange={(e) => setForm({ ...form, phoneNo: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="college">College</Label>
                  <Input
                    id="college"
                    value={form.college}
                    onChange={(e) => setForm({ ...form, college: e.target.value })}
                  />
                </div>
              </div>
              <Button type="submit" className="rounded-full">
                Add {label}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
