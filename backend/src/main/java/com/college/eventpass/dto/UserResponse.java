package com.college.eventpass.dto;

import com.college.eventpass.entity.Role;

public record UserResponse(
        Long userId,
        String userName,
        Role role,
        String email,
        String phoneNo,
        String college
) {
}
