# Event Pass Management System

A college runs technical events. Students register for an event, get a pass, and check in on
the event day. Everything in this project comes from one ER diagram and the five modules -
nothing else was added.

```
USER  1 ----< REGISTRATION >---- 1  EVENT
                  1
                  |
                0..1
              CHECK_IN
```

| Layer    | Technology                        |
| -------- | --------------------------------- |
| Frontend | React 19 / Next.js 16 (App Router), Tailwind v4, shadcn/ui |
| Backend  | Java 21 (built on JDK 25), Spring Boot 3.5.6, Spring Data JPA |
| Database | MySQL 8.0                         |

---

## 1. The ER diagram in the database

| ER entity        | Table            | Columns                                                                 |
| ---------------- | ---------------- | ----------------------------------------------------------------------- |
| USER             | `users`          | `user_id` PK, `user_name`, `role`, `email`, `phone_no`, `college`        |
| EVENT            | `event`          | `event_id` PK, `event_name`, `event_date`, `capacity`, `organizer_id` FK |
| REGISTRATION     | `registration`   | `reg_id` PK, `stud_id` FK, `event_id` FK, `status`                       |
| CHECK-IN EVENT   | `check_in_event` | `check_in_id` PK, `reg_id` FK (unique), `check_status`                   |

Relationships, exactly as drawn:

* `USER 1 --- N REGISTRATION` &rarr; `registration.stud_id` &rarr; `users.user_id`
* `EVENT 1 --- N REGISTRATION` &rarr; `registration.event_id` &rarr; `event.event_id`
* `REGISTRATION 1 --- 0..1 CHECK_IN` &rarr; `check_in_event.reg_id` is a **unique** FK, so a
  registration has at most one check-in. The student and the event are already carried by the
  registration row, which is why the check-in table does not repeat them.
* `USER --(Creates)--> EVENT` &rarr; `event.organizer_id` &rarr; `users.user_id`

Two constraints carry the rules that the modules describe:

* `UNIQUE (stud_id, event_id)` on `registration` - a student can register once only.
* `UNIQUE (reg_id)` on `check_in_event` - check-in is allowed only once.

There is **no password column anywhere**, because the ER has none. The frontend therefore uses a
*simulated login*: you pick the USER row you want to act as.

## 2. The modules

| # | Module               | Where it lives                                     | Rules enforced                                                                        |
| - | -------------------- | -------------------------------------------------- | ------------------------------------------------------------------------------------- |
| 1 | Create Event         | `EventService.createEvent`                          | Only a user whose role is `ORGANIZER`; name + date + capacity; status starts `OPEN`.  |
| 2 | Register for Event   | `RegistrationService.register`                      | One registration per student per event; blocked when `registered >= capacity`.        |
| 3 | Cancel Registration  | `RegistrationService.cancel`                        | Only before the event day; sets `status = CANCELLED`, so the seat is free again.      |
| 4 | Check-In to Event    | `CheckInService.checkIn`                            | Only on the event day, only if registered, and only once.                             |
| 5 | View Event Summary   | `EventService.getEventSummary`                      | Event Name, Capacity, Registered Count, Checked-In Count.                             |
|   | SQL Task             | `RegistrationRepository.findTopEventsByRegistrations` | Event Name + Total Registrations, highest first.                                     |

Event status (`OPEN` / `FULL`) is **calculated** from capacity minus active registrations - it is
not an extra column, because the ER does not have one.

---

## 3. Running it

### Prerequisites

MySQL 8.0 running, JDK 21+, Maven, Node 20+ and pnpm.

### Step 1 - Database

Open MySQL Workbench and run, in order:

```
database/01_schema.sql        creates event_pass_db and the four tables
database/02_sample_data.sql   optional demo data (one event is dated today, for check-in)
database/03_sql_task.sql      the SQL task query
```

Re-running `01_schema.sql` is safe. Every statement uses `IF NOT EXISTS`, so on a second run
Workbench reports warnings 1007 / 1050 ("database / table already exists") and changes nothing.

### Step 2 - Backend (port 8081)

`application.properties` is git-ignored because it holds your MySQL login. Create it from the
template the first time:

```bash
cd backend/src/main/resources
cp application.properties.example application.properties   # then fill in your MySQL user + password
```

```bash
cd backend
mvn spring-boot:run
```

The API starts on <http://localhost:8081>. Port 8080 is skipped because Jenkins already uses it
on this machine.

### Step 3 - Frontend (port 3000)

```bash
cd frontend
pnpm install
pnpm dev
```

Open <http://localhost:3000>. The landing page is the entry screen; **Enter as student** /
**Enter as organizer** both go to `/login`, where you pick the user you want to be.

* `/login` - simulated login: pick a STUDENT or an ORGANIZER, or add a new USER row.
* `/student` - **Events** (Register only) and **My Passes**, where the action follows the date:
  **Cancel** appears only while the event is still ahead, **Check in** appears only on the event
  day itself, and once you are checked in (or cancelled, or the event has passed) there is no
  action left.
* `/organizer` - **Event Summary** (name, date, capacity, registered, checked-in, status),
  **Create Event**, and **Highest Registrations**.

The API address is read from `frontend/.env` (`NEXT_PUBLIC_API_BASE`).

---

## 4. API

| Method | Path                                | Purpose                                      |
| ------ | ----------------------------------- | -------------------------------------------- |
| POST   | `/api/users`                        | Add a USER (student or organizer)            |
| GET    | `/api/users?role=STUDENT`           | List users - feeds the simulated login        |
| GET    | `/api/users/{userId}`               | One user                                     |
| POST   | `/api/events`                       | Module 1 - create event                      |
| GET    | `/api/events`                       | All events with registered / available / status |
| GET    | `/api/events/organizer/{id}`        | Events created by one organizer              |
| GET    | `/api/events/{eventId}`             | One event                                    |
| GET    | `/api/events/{eventId}/summary`     | Module 5 - summary of one event              |
| GET    | `/api/events/summary`               | Module 5 - summary of every event            |
| GET    | `/api/events/top-registrations`     | SQL task - highest registrations first       |
| POST   | `/api/registrations`                | Module 2 - register                          |
| PUT    | `/api/registrations/{regId}/cancel` | Module 3 - cancel                            |
| GET    | `/api/registrations/student/{id}`   | A student's passes                           |
| GET    | `/api/registrations/event/{id}`     | Active registrations of an event             |
| POST   | `/api/check-ins`                    | Module 4 - check in                          |

A broken rule returns `409 Conflict` with a readable message, for example:

```json
{ "status": 409, "error": "Conflict", "message": "Code Sprint 2026 is full (capacity 3). Registration is blocked." }
```

## 5. SQL task

```sql
SELECT e.event_name     AS Event_Name,
       COUNT(r.stud_id) AS Total_Registrations
FROM event e
         JOIN registration r ON r.event_id = e.event_id
WHERE r.status = 'REGISTERED'
GROUP BY e.event_id, e.event_name
ORDER BY Total_Registrations DESC;
```

## 6. Layout

```
Grand-Coding/
├── backend/          Spring Boot API (entity / repository / service / controller / dto / exception)
├── frontend/         Next.js app - landing page + /login, /student, /organizer
├── database/         schema, sample data, SQL task
└── README.md
```
