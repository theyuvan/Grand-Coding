package com.college.eventpass.controller;

import com.college.eventpass.dto.EventRequest;
import com.college.eventpass.dto.EventResponse;
import com.college.eventpass.dto.EventSummaryResponse;
import com.college.eventpass.dto.TopEventResponse;
import com.college.eventpass.service.EventService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

/**
 * Module 1 - Create Event.
 * Module 5 - View Event Summary (organizer side).
 * SQL Task  - Events with the highest registrations.
 */
@RestController
@RequestMapping("/api/events")
public class EventController {

    private final EventService eventService;

    public EventController(EventService eventService) {
        this.eventService = eventService;
    }

    @PostMapping
    public ResponseEntity<EventResponse> createEvent(@Valid @RequestBody EventRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(eventService.createEvent(request));
    }

    @GetMapping
    public List<EventResponse> getAllEvents() {
        return eventService.getAllEvents();
    }

    @GetMapping("/summary")
    public List<EventSummaryResponse> getAllSummaries() {
        return eventService.getAllEventSummaries();
    }

    @GetMapping("/top-registrations")
    public List<TopEventResponse> getTopEventsByRegistrations() {
        return eventService.getTopEventsByRegistrations();
    }

    @GetMapping("/organizer/{organizerId}")
    public List<EventResponse> getEventsByOrganizer(@PathVariable Long organizerId) {
        return eventService.getEventsByOrganizer(organizerId);
    }

    @GetMapping("/{eventId}")
    public EventResponse getEvent(@PathVariable Long eventId) {
        return eventService.getEvent(eventId);
    }

    @GetMapping("/{eventId}/summary")
    public EventSummaryResponse getEventSummary(@PathVariable Long eventId) {
        return eventService.getEventSummary(eventId);
    }
}
