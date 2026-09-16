package com.college.eventpass.dto;

import com.college.eventpass.entity.RegistrationStatus;

import java.time.LocalDate;

public record RegistrationResponse(
        Long regId,
        Long studId,
        String studentName,
        Long eventId,
        String eventName,
        LocalDate eventDate,
        RegistrationStatus status,
        String checkStatus
) {
}
