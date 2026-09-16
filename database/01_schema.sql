-- =====================================================================
-- Event Pass Management System - Schema
-- Built exactly from the ER diagram:
--   USER 1 --- N REGISTRATION N --- 1 EVENT
--   REGISTRATION 1 --- 0..1 CHECK_IN
--   USER --(Creates)--> EVENT
-- =====================================================================

CREATE DATABASE IF NOT EXISTS event_pass_db;
USE event_pass_db;

-- ---------------------------------------------------------------------
-- ER entity: USER
-- User_id (PK), User_name, Role, Email, Phone_no, College
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS users (
    user_id   BIGINT       NOT NULL AUTO_INCREMENT,
    user_name VARCHAR(100) NOT NULL,
    role      VARCHAR(20)  NOT NULL,
    email     VARCHAR(120) NOT NULL,
    phone_no  VARCHAR(20),
    college   VARCHAR(150),
    PRIMARY KEY (user_id),
    CONSTRAINT uq_users_email UNIQUE (email),
    CONSTRAINT ck_users_role CHECK (role IN ('STUDENT', 'ORGANIZER'))
);

-- ---------------------------------------------------------------------
-- ER entity: EVENT
-- Event_id (PK), Event_Name, Event_Date, Capacity
-- organizer_id = the ER "Creates" relationship (USER -> EVENT)
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS event (
    event_id     BIGINT       NOT NULL AUTO_INCREMENT,
    event_name   VARCHAR(150) NOT NULL,
    event_date   DATE         NOT NULL,
    capacity     INT          NOT NULL,
    organizer_id BIGINT       NOT NULL,
    PRIMARY KEY (event_id),
    CONSTRAINT fk_event_organizer FOREIGN KEY (organizer_id) REFERENCES users (user_id),
    CONSTRAINT ck_event_capacity CHECK (capacity >= 1)
);

-- ---------------------------------------------------------------------
-- ER entity: REGISTRATION
-- Reg_ID (PK), Stud_id (FK -> USER), Event_id (FK -> EVENT), Status
-- UNIQUE (stud_id, event_id) enforces "a student can register once only"
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS registration (
    reg_id   BIGINT      NOT NULL AUTO_INCREMENT,
    stud_id  BIGINT      NOT NULL,
    event_id BIGINT      NOT NULL,
    status   VARCHAR(20) NOT NULL,
    PRIMARY KEY (reg_id),
    CONSTRAINT uq_registration_student_event UNIQUE (stud_id, event_id),
    CONSTRAINT fk_registration_student FOREIGN KEY (stud_id) REFERENCES users (user_id),
    CONSTRAINT fk_registration_event FOREIGN KEY (event_id) REFERENCES event (event_id),
    CONSTRAINT ck_registration_status CHECK (status IN ('REGISTERED', 'CANCELLED'))
);

-- ---------------------------------------------------------------------
-- ER entity: CHECK-IN EVENT
-- Check_In_Id (PK), Reg_id (FK -> REGISTRATION), Check_Status
-- UNIQUE (reg_id) enforces "check-in is allowed only once" (1 --- 0..1)
-- The student and the event are already carried by the registration row.
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS check_in_event (
    check_in_id  BIGINT      NOT NULL AUTO_INCREMENT,
    reg_id       BIGINT      NOT NULL,
    check_status VARCHAR(20) NOT NULL,
    PRIMARY KEY (check_in_id),
    CONSTRAINT uq_check_in_registration UNIQUE (reg_id),
    CONSTRAINT fk_check_in_registration FOREIGN KEY (reg_id) REFERENCES registration (reg_id),
    CONSTRAINT ck_check_in_status CHECK (check_status IN ('CHECKED_IN'))
);
