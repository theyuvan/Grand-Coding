package com.college.eventpass.repository;

import com.college.eventpass.entity.Registration;
import com.college.eventpass.entity.RegistrationStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;
import java.util.Optional;

public interface RegistrationRepository extends JpaRepository<Registration, Long> {

    Optional<Registration> findByStudentUserIdAndEventEventId(Long studId, Long eventId);

    long countByEventEventIdAndStatus(Long eventId, RegistrationStatus status);

    List<Registration> findByEventEventIdAndStatus(Long eventId, RegistrationStatus status);

    List<Registration> findByStudentUserIdOrderByRegIdDesc(Long studId);

    /**
     * SQL Task: events with the highest registrations.
     * Shows Event Name and Total Registrations, sorted by registration count descending.
     */
    @Query(value = """
            SELECT e.event_name AS eventName,
                   COUNT(r.stud_id) AS totalRegistrations
            FROM event e
            JOIN registration r ON r.event_id = e.event_id
            WHERE r.status = 'REGISTERED'
            GROUP BY e.event_id, e.event_name
            ORDER BY totalRegistrations DESC
            """, nativeQuery = true)
    List<TopEventProjection> findTopEventsByRegistrations();
}
