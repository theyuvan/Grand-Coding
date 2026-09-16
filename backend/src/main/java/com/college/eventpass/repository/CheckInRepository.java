package com.college.eventpass.repository;

import com.college.eventpass.entity.CheckIn;
import com.college.eventpass.entity.RegistrationStatus;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface CheckInRepository extends JpaRepository<CheckIn, Long> {

    boolean existsByRegistrationRegId(Long regId);

    Optional<CheckIn> findByRegistrationRegId(Long regId);

    long countByRegistrationEventEventIdAndRegistrationStatus(Long eventId, RegistrationStatus status);
}
