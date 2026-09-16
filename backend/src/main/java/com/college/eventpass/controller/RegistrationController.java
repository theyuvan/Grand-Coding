package com.college.eventpass.controller;

import com.college.eventpass.dto.RegistrationRequest;
import com.college.eventpass.dto.RegistrationResponse;
import com.college.eventpass.service.RegistrationService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

/**
 * Module 2 - Register for Event.
 * Module 3 - Cancel Registration.
 */
@RestController
@RequestMapping("/api/registrations")
public class RegistrationController {

    private final RegistrationService registrationService;

    public RegistrationController(RegistrationService registrationService) {
        this.registrationService = registrationService;
    }

    @PostMapping
    public ResponseEntity<RegistrationResponse> register(@Valid @RequestBody RegistrationRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(registrationService.register(request));
    }

    @PutMapping("/{regId}/cancel")
    public RegistrationResponse cancel(@PathVariable Long regId) {
        return registrationService.cancel(regId);
    }

    @GetMapping("/student/{studId}")
    public List<RegistrationResponse> getByStudent(@PathVariable Long studId) {
        return registrationService.getRegistrationsByStudent(studId);
    }

    @GetMapping("/event/{eventId}")
    public List<RegistrationResponse> getByEvent(@PathVariable Long eventId) {
        return registrationService.getRegistrationsByEvent(eventId);
    }
}
