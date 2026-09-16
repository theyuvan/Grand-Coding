const BASE = process.env.NEXT_PUBLIC_API_BASE ?? "http://localhost:8081/api";

export type Role = "STUDENT" | "ORGANIZER";
export type RegistrationStatus = "REGISTERED" | "CANCELLED";

/** ER entity: USER */
export type User = {
  userId: number;
  userName: string;
  role: Role;
  email: string;
  phoneNo: string | null;
  college: string | null;
};

/** ER entity: EVENT */
export type Event = {
  eventId: number;
  eventName: string;
  eventDate: string;
  capacity: number;
  organizerId: number;
  organizerName: string;
  registeredCount: number;
  availableSeats: number;
  status: "OPEN" | "FULL";
};

/** ER entity: REGISTRATION (+ the check-in status of that registration) */
export type Registration = {
  regId: number;
  studId: number;
  studentName: string;
  eventId: number;
  eventName: string;
  eventDate: string;
  status: RegistrationStatus;
  checkStatus: "CHECKED_IN" | "NOT_CHECKED_IN";
};

/** ER entity: CHECK-IN EVENT */
export type CheckIn = {
  checkInId: number;
  regId: number;
  studId: number;
  studentName: string;
  eventId: number;
  eventName: string;
  checkStatus: "CHECKED_IN";
};

export type EventSummary = {
  eventId: number;
  eventName: string;
  capacity: number;
  registeredCount: number;
  checkedInCount: number;
};

export type TopEvent = {
  eventName: string;
  totalRegistrations: number;
};

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const response = await fetch(BASE + path, {
    headers: { "Content-Type": "application/json" },
    ...options,
  });
  const text = await response.text();
  const data = text ? JSON.parse(text) : null;
  if (!response.ok) {
    throw new Error(data?.message || "Request failed");
  }
  return data as T;
}

export const api = {
  // USER - the simulated login just picks one of these rows
  getUsers: (role?: Role) => request<User[]>(role ? `/users?role=${role}` : "/users"),
  createUser: (body: {
    userName: string;
    role: Role;
    email: string;
    phoneNo?: string;
    college?: string;
  }) => request<User>("/users", { method: "POST", body: JSON.stringify(body) }),

  // EVENT
  getEvents: () => request<Event[]>("/events"),
  getEventsByOrganizer: (organizerId: number) =>
    request<Event[]>(`/events/organizer/${organizerId}`),
  createEvent: (body: {
    organizerId: number;
    eventName: string;
    eventDate: string;
    capacity: number;
  }) => request<Event>("/events", { method: "POST", body: JSON.stringify(body) }),
  getSummaries: () => request<EventSummary[]>("/events/summary"),
  getTopEvents: () => request<TopEvent[]>("/events/top-registrations"),

  // REGISTRATION
  register: (body: { studId: number; eventId: number }) =>
    request<Registration>("/registrations", { method: "POST", body: JSON.stringify(body) }),
  cancelRegistration: (regId: number) =>
    request<Registration>(`/registrations/${regId}/cancel`, { method: "PUT" }),
  getStudentRegistrations: (studId: number) =>
    request<Registration[]>(`/registrations/student/${studId}`),

  // CHECK-IN
  checkIn: (body: { studId: number; eventId: number }) =>
    request<CheckIn>("/check-ins", { method: "POST", body: JSON.stringify(body) }),
};
