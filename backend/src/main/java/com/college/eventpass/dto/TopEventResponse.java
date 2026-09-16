package com.college.eventpass.dto;

/** SQL Task - Event Name and Total Registrations, highest first. */
public record TopEventResponse(
        String eventName,
        long totalRegistrations
) {
}
