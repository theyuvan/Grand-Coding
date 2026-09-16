package com.college.eventpass.dto;

import jakarta.validation.constraints.NotNull;

/** Module 4 - Check-In to Event. */
public record CheckInRequest(
        @NotNull(message = "Student id is required")
        Long studId,

        @NotNull(message = "Event id is required")
        Long eventId
) {
}
