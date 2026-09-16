package com.college.eventpass.service;

import com.college.eventpass.dto.CheckInRequest;
import com.college.eventpass.dto.CheckInResponse;
import com.college.eventpass.entity.CheckIn;
import com.college.eventpass.entity.CheckStatus;
import com.college.eventpass.entity.Registration;
import com.college.eventpass.entity.RegistrationStatus;
import com.college.eventpass.exception.BusinessRuleException;
import com.college.eventpass.repository.CheckInRepository;
import com.college.eventpass.repository.RegistrationRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;

/**
 * Module 4 - Check-In to Event: on the event day, only registered students,
 * and check-in is allowed only once.
 */
@Service
public class CheckInService {

    private final CheckInRepository checkInRepository;
    private final RegistrationRepository registrationRepository;
    private final EventService eventService;

    public CheckInService(CheckInRepository checkInRepository,
                          RegistrationRepository registrationRepository,
                          EventService eventService) {
        this.checkInRepository = checkInRepository;
        this.registrationRepository = registrationRepository;
        this.eventService = eventService;
    }

    @Transactional
    public CheckInResponse checkIn(CheckInRequest request) {
        eventService.findEventOrThrow(request.eventId());

        Registration registration = registrationRepository
                .findByStudentUserIdAndEventEventId(request.studId(), request.eventId())
                .orElseThrow(() -> new BusinessRuleException(
                        "Student " + request.studId() + " is not registered for event " + request.eventId()));

        if (registration.getStatus() != RegistrationStatus.REGISTERED) {
            throw new BusinessRuleException("Registration was cancelled, check-in is not allowed");
        }

        LocalDate eventDate = registration.getEvent().getEventDate();
        if (!eventDate.isEqual(LocalDate.now())) {
            throw new BusinessRuleException("Check-in is allowed only on the event day (" + eventDate + ")");
        }

        if (checkInRepository.existsByRegistrationRegId(registration.getRegId())) {
            throw new BusinessRuleException(registration.getStudent().getUserName()
                    + " has already checked in for " + registration.getEvent().getEventName());
        }

        CheckIn checkIn = new CheckIn();
        checkIn.setRegistration(registration);
        checkIn.setCheckStatus(CheckStatus.CHECKED_IN);
        CheckIn saved = checkInRepository.save(checkIn);

        return new CheckInResponse(
                saved.getCheckInId(),
                registration.getRegId(),
                registration.getStudent().getUserId(),
                registration.getStudent().getUserName(),
                registration.getEvent().getEventId(),
                registration.getEvent().getEventName(),
                saved.getCheckStatus()
        );
    }
}
