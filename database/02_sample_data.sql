-- =====================================================================
-- Event Pass Management System - Sample data (optional, for testing)
-- Run 01_schema.sql first.
-- =====================================================================
USE event_pass_db;

-- ---------------- USERS (organizers + students) ----------------
INSERT INTO users (user_name, role, email, phone_no, college) VALUES
    ('Arun Kumar',   'ORGANIZER', 'arun.organizer@college.edu',  '9876500001', 'KCT College of Engineering'),
    ('Divya Menon',  'ORGANIZER', 'divya.organizer@college.edu', '9876500002', 'KCT College of Engineering'),
    ('Yuvan R',      'STUDENT',   'yuvan@college.edu',           '9876511001', 'KCT College of Engineering'),
    ('Sneha Ravi',   'STUDENT',   'sneha@college.edu',           '9876511002', 'KCT College of Engineering'),
    ('Karthik S',    'STUDENT',   'karthik@college.edu',         '9876511003', 'KCT College of Engineering'),
    ('Priya Nair',   'STUDENT',   'priya@college.edu',           '9876511004', 'KCT College of Engineering'),
    ('Mohan Raj',    'STUDENT',   'mohan@college.edu',           '9876511005', 'KCT College of Engineering');

-- ---------------- EVENTS ----------------
-- One event is dated today so that check-in can be demonstrated.
INSERT INTO event (event_name, event_date, capacity, organizer_id) VALUES
    ('Code Sprint 2026',    CURDATE(),                       3, 1),
    ('AI Workshop',         DATE_ADD(CURDATE(), INTERVAL 7 DAY),  2, 1),
    ('Robotics Expo',       DATE_ADD(CURDATE(), INTERVAL 15 DAY), 4, 2),
    ('Paper Presentation',  DATE_ADD(CURDATE(), INTERVAL 21 DAY), 5, 2);

-- ---------------- REGISTRATIONS ----------------
INSERT INTO registration (stud_id, event_id, status) VALUES
    (3, 1, 'REGISTERED'),
    (4, 1, 'REGISTERED'),
    (5, 1, 'REGISTERED'),
    (3, 2, 'REGISTERED'),
    (4, 2, 'REGISTERED'),
    (5, 3, 'REGISTERED'),
    (6, 3, 'REGISTERED'),
    (7, 3, 'CANCELLED');

-- ---------------- CHECK-INS (event day only) ----------------
INSERT INTO check_in_event (reg_id, check_status) VALUES
    (1, 'CHECKED_IN'),
    (2, 'CHECKED_IN');
