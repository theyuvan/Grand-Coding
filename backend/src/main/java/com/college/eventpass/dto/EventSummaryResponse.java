package com.college.eventpass.dto;

/** Module 5 - View Event Summary: Event Name, Capacity, Registered Count, Checked-In Count. */
public record EventSummaryResponse(
        Long eventId,
        String eventName,
        Integer capacity,
        long registeredCount,
        long checkedInCount
) {
}
