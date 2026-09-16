package com.college.eventpass.service;

import com.college.eventpass.dto.EventRequest;
import com.college.eventpass.dto.EventResponse;
import com.college.eventpass.dto.EventSummaryResponse;
import com.college.eventpass.dto.TopEventResponse;
import com.college.eventpass.entity.Event;
import com.college.eventpass.entity.RegistrationStatus;
import com.college.eventpass.entity.Role;
import com.college.eventpass.entity.User;
import com.college.eventpass.exception.BusinessRuleException;
import com.college.eventpass.exception.ResourceNotFoundException;
import com.college.eventpass.repository.CheckInRepository;
import com.college.eventpass.repository.EventRepository;
import com.college.eventpass.repository.RegistrationRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

/**
 * Module 1 - Create Event (organizer only, event status Open).
 * Module 5 - View Event Summary.
 * SQL Task  - Events with the highest registrations.
 */
@Service
public class EventService {

    public static final String STATUS_OPEN = "OPEN";
    public static final String STATUS_FULL = "FULL";

    private final EventRepository eventRepository;
    private final RegistrationRepository registrationRepository;
    private final CheckInRepository checkInRepository;
    private final UserService userService;

    public EventService(EventRepository eventRepository,
                        RegistrationRepository registrationRepository,
                        CheckInRepository checkInRepository,
                        UserService userService) {
        this.eventRepository = eventRepository;
        this.registrationRepository = registrationRepository;
        this.checkInRepository = checkInRepository;
        this.userService = userService;
    }

    /** Module 1: an organizer creates an event with name, date and maximum capacity. */
    @Transactional
    public EventResponse createEvent(EventRequest request) {
        User organizer = userService.findUserOrThrow(request.organizerId());
        if (organizer.getRole() != Role.ORGANIZER) {
            throw new BusinessRuleException("Only an ORGANIZER can create an event");
        }
        Event event = new Event();
        event.setEventName(request.eventName());
        event.setEventDate(request.eventDate());
        event.setCapacity(request.capacity());
        event.setOrganizer(organizer);
        return toResponse(eventRepository.save(event));
    }

    @Transactional(readOnly = true)
    public List<EventResponse> getAllEvents() {
        return eventRepository.findAllByOrderByEventDateAsc().stream().map(this::toResponse).toList();
    }

    @Transactional(readOnly = true)
    public List<EventResponse> getEventsByOrganizer(Long organizerId) {
        userService.findUserOrThrow(organizerId);
        return eventRepository.findByOrganizerUserIdOrderByEventDateAsc(organizerId)
                .stream().map(this::toResponse).toList();
    }

    @Transactional(readOnly = true)
    public EventResponse getEvent(Long eventId) {
        return toResponse(findEventOrThrow(eventId));
    }

    /** Module 5: Event Name, Capacity, Registered Count, Checked-In Count. */
    @Transactional(readOnly = true)
    public EventSummaryResponse getEventSummary(Long eventId) {
        return toSummary(findEventOrThrow(eventId));
    }

    @Transactional(readOnly = true)
    public List<EventSummaryResponse> getAllEventSummaries() {
        return eventRepository.findAllByOrderByEventDateAsc().stream().map(this::toSummary).toList();
    }

    /** SQL Task: Event Name + Total Registrations, sorted by registration count descending. */
    @Transactional(readOnly = true)
    public List<TopEventResponse> getTopEventsByRegistrations() {
        return registrationRepository.findTopEventsByRegistrations().stream()
                .map(row -> new TopEventResponse(row.getEventName(), row.getTotalRegistrations()))
                .toList();
    }

    @Transactional(readOnly = true)
    public Event findEventOrThrow(Long eventId) {
        return eventRepository.findById(eventId)
                .orElseThrow(() -> new ResourceNotFoundException("Event not found with id " + eventId));
    }

    public long registeredCount(Long eventId) {
        return registrationRepository.countByEventEventIdAndStatus(eventId, RegistrationStatus.REGISTERED);
    }

    public long checkedInCount(Long eventId) {
        return checkInRepository.countByRegistrationEventEventIdAndRegistrationStatus(
                eventId, RegistrationStatus.REGISTERED);
    }

    private EventResponse toResponse(Event event) {
        long registered = registeredCount(event.getEventId());
        long available = event.getCapacity() - registered;
        return new EventResponse(
                event.getEventId(),
                event.getEventName(),
                event.getEventDate(),
                event.getCapacity(),
                event.getOrganizer().getUserId(),
                event.getOrganizer().getUserName(),
                registered,
                Math.max(available, 0),
                available > 0 ? STATUS_OPEN : STATUS_FULL
        );
    }

    private EventSummaryResponse toSummary(Event event) {
        return new EventSummaryResponse(
                event.getEventId(),
                event.getEventName(),
                event.getCapacity(),
                registeredCount(event.getEventId()),
                checkedInCount(event.getEventId())
        );
    }
}
