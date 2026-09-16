package com.college.eventpass.dto;

import com.college.eventpass.entity.Role;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

/** Payload to create a USER (student or organizer). */
public record UserRequest(
        @NotBlank(message = "User name is required")
        String userName,

        @NotNull(message = "Role is required (STUDENT or ORGANIZER)")
        Role role,

        @NotBlank(message = "Email is required")
        @Email(message = "Email is not valid")
        String email,

        String phoneNo,

        String college
) {
}
