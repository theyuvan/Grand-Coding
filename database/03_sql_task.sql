-- =====================================================================
-- SQL TASK
-- Display events with the highest registrations.
-- Show Event Name and Total Registrations. Sort by registration count DESC.
-- =====================================================================
USE event_pass_db;

-- Active registrations only (a cancelled registration frees the seat,
-- so it is not counted as a registration).
SELECT e.event_name                AS Event_Name,
       COUNT(r.stud_id)            AS Total_Registrations
FROM event e
         JOIN registration r ON r.event_id = e.event_id
WHERE r.status = 'REGISTERED'
GROUP BY e.event_id, e.event_name
ORDER BY Total_Registrations DESC;

-- Same query counting every registration row ever made
-- (including the cancelled ones):
-- SELECT e.event_name      AS Event_Name,
--        COUNT(r.stud_id)  AS Total_Registrations
-- FROM event e
--          JOIN registration r ON r.event_id = e.event_id
-- GROUP BY e.event_id, e.event_name
-- ORDER BY Total_Registrations DESC;
