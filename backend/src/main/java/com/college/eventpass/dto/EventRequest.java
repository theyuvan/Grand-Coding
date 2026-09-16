package com.college.eventpass.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.time.LocalDate;

/** Module 1 - Create Event: Event Name, Event Date, Maximum Capacity. */
public record EventRequest(
        @NotNull(message = "Organizer id is required")
        Long organizerId,

        @NotBlank(message = "Event name is required")
        String eventName,

        @NotNull(message = "Event date is required")
        LocalDate eventDate,

        @NotNull(message = "Capacity is required")
        @Min(value = 1, message = "Capacity must be at least 1")
        Integer capacity
) {
}
