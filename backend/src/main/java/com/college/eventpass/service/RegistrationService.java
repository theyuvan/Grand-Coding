package com.college.eventpass.service;

import com.college.eventpass.dto.RegistrationRequest;
import com.college.eventpass.dto.RegistrationResponse;
import com.college.eventpass.entity.Event;
import com.college.eventpass.entity.Registration;
import com.college.eventpass.entity.RegistrationStatus;
import com.college.eventpass.entity.Role;
import com.college.eventpass.entity.User;
import com.college.eventpass.exception.BusinessRuleException;
import com.college.eventpass.exception.ResourceNotFoundException;
import com.college.eventpass.repository.CheckInRepository;
import com.college.eventpass.repository.RegistrationRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

/**
 * Module 2 - Register for Event (once only, capacity cannot be exceeded).
 * Module 3 - Cancel Registration (before the event, capacity becomes available again).
 */
@Service
public class RegistrationService {

    private final RegistrationRepository registrationRepository;
    private final CheckInRepository checkInRepository;
    private final UserService userService;
    private final EventService eventService;

    public RegistrationService(RegistrationRepository registrationRepository,
                               CheckInRepository checkInRepository,
                               UserService userService,
                               EventService eventService) {
        this.registrationRepository = registrationRepository;
        this.checkInRepository = checkInRepository;
        this.userService = userService;
        this.eventService = eventService;
    }

    /** Module 2: a student registers once only and only while seats are available. */
    @Transactional
    public RegistrationResponse register(RegistrationRequest request) {
        User student = userService.findUserOrThrow(request.studId());
        if (student.getRole() != Role.STUDENT) {
            throw new BusinessRuleException("Only a STUDENT can register for an event");
        }
        Event event = eventService.findEventOrThrow(request.eventId());

        Optional<Registration> existing =
                registrationRepository.findByStudentUserIdAndEventEventId(student.getUserId(), event.getEventId());
        if (existing.isPresent() && existing.get().getStatus() == RegistrationStatus.REGISTERED) {
            throw new BusinessRuleException(
                    student.getUserName() + " is already registered for " + event.getEventName());
        }

        long registered = eventService.registeredCount(event.getEventId());
        if (registered >= event.getCapacity()) {
            throw new BusinessRuleException(
                    event.getEventName() + " is full (capacity " + event.getCapacity()
                            + "). Registration is blocked.");
        }

        Registration registration = existing.orElseGet(() -> {
            Registration fresh = new Registration();
            fresh.setStudent(student);
            fresh.setEvent(event);
            return fresh;
        });
        registration.setStatus(RegistrationStatus.REGISTERED);
        return toResponse(registrationRepository.save(registration));
    }

    /** Module 3: cancel before the event; the seat becomes available again. */
    @Transactional
    public RegistrationResponse cancel(Long regId) {
        Registration registration = findRegistrationOrThrow(regId);
        if (registration.getStatus() != RegistrationStatus.REGISTERED) {
            throw new BusinessRuleException("Registration " + regId + " is already cancelled");
        }
        LocalDate eventDate = registration.getEvent().getEventDate();
        if (!eventDate.isAfter(LocalDate.now())) {
            throw new BusinessRuleException(
                    "Cancellation is allowed only before the event day (" + eventDate + ")");
        }
        registration.setStatus(RegistrationStatus.CANCELLED);
        return toResponse(registrationRepository.save(registration));
    }

    @Transactional(readOnly = true)
    public List<RegistrationResponse> getRegistrationsByStudent(Long studId) {
        userService.findUserOrThrow(studId);
        return registrationRepository.findByStudentUserIdOrderByRegIdDesc(studId)
                .stream().map(this::toResponse).toList();
    }

    @Transactional(readOnly = true)
    public List<RegistrationResponse> getRegistrationsByEvent(Long eventId) {
        eventService.findEventOrThrow(eventId);
        return registrationRepository.findByEventEventIdAndStatus(eventId, RegistrationStatus.REGISTERED)
                .stream().map(this::toResponse).toList();
    }

    @Transactional(readOnly = true)
    public Registration findRegistrationOrThrow(Long regId) {
        return registrationRepository.findById(regId)
                .orElseThrow(() -> new ResourceNotFoundException("Registration not found with id " + regId));
    }

    RegistrationResponse toResponse(Registration registration) {
        String checkStatus = checkInRepository.findByRegistrationRegId(registration.getRegId())
                .map(checkIn -> checkIn.getCheckStatus().name())
                .orElse("NOT_CHECKED_IN");
        return new RegistrationResponse(
                registration.getRegId(),
                registration.getStudent().getUserId(),
                registration.getStudent().getUserName(),
                registration.getEvent().getEventId(),
                registration.getEvent().getEventName(),
                registration.getEvent().getEventDate(),
                registration.getStatus(),
                checkStatus
        );
    }
}
