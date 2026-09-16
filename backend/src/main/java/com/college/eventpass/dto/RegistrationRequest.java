package com.college.eventpass.dto;

import jakarta.validation.constraints.NotNull;

/** Module 2 - Register for Event. */
public record RegistrationRequest(
        @NotNull(message = "Student id is required")
        Long studId,

        @NotNull(message = "Event id is required")
        Long eventId
) {
}
