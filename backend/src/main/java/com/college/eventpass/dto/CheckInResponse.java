package com.college.eventpass.dto;

import com.college.eventpass.entity.CheckStatus;

public record CheckInResponse(
        Long checkInId,
        Long regId,
        Long studId,
        String studentName,
        Long eventId,
        String eventName,
        CheckStatus checkStatus
) {
}
