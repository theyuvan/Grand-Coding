package com.college.eventpass.dto;

import java.time.LocalDate;

public record EventResponse(
        Long eventId,
        String eventName,
        LocalDate eventDate,
        Integer capacity,
        Long organizerId,
        String organizerName,
        long registeredCount,
        long availableSeats,
        String status
) {
}
