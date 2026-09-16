"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { api, type Role, type User } from "@/lib/api";
import { saveSession } from "@/lib/session";
import { Notice } from "@/components/app/app-shell";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

const EMPTY_USER = { userName: "", email: "", phoneNo: "", college: "" };

/**
 * Simulated login: there is no password anywhere in the ER, so entering the
 * app means picking the USER row you want to act as.
 */
export default function LoginPage() {
  const router = useRouter();
  const [role, setRole] = useState<Role>("STUDENT");
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
      <div className="mx-auto max-w-2xl px-6 py-16">
        <Link href="/" className="font-mono text-xs text-muted-foreground hover:text-foreground">
          &larr; Back
        </Link>

        <h1 className="mt-6 font-display text-4xl tracking-tight">Enter the event pass system</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Choose who you want to enter as. No password is used - this is a simulated login.
        </p>

        <Tabs
          value={role}
          onValueChange={(value) => setRole(value as Role)}
          className="mt-8"
        >
          <TabsList>
            <TabsTrigger value="STUDENT">Student</TabsTrigger>
            <TabsTrigger value="ORGANIZER">Organizer</TabsTrigger>
          </TabsList>
        </Tabs>

        <div className="mt-6">
          <Notice message={message} />
        </div>

        <Card className="mt-2">
          <CardHeader>
            <CardTitle>{role === "STUDENT" ? "Students" : "Organizers"}</CardTitle>
            <CardDescription>Click Enter to continue as that user.</CardDescription>
          </CardHeader>
          <CardContent>
            {users.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                No {role.toLowerCase()} found. Add one below.
              </p>
            ) : (
              <ul className="divide-y divide-foreground/10">
                {users.map((user) => (
                  <li key={user.userId} className="flex items-center justify-between gap-4 py-3">
                    <div>
                      <p className="text-sm">{user.userName}</p>
                      <p className="font-mono text-xs text-muted-foreground">
                        {user.email}
                        {user.college ? ` · ${user.college}` : ""}
                        {user.phoneNo ? ` · ${user.phoneNo}` : ""}
                      </p>
                    </div>
                    <Button size="sm" className="rounded-full" onClick={() => enterAs(user)}>
                      Enter
                    </Button>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>

        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Add a new {role.toLowerCase()}</CardTitle>
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
                Add {role === "STUDENT" ? "student" : "organizer"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
