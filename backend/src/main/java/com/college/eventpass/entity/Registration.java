package com.college.eventpass.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;

/**
 * ER entity: REGISTRATION
 * Attributes: Reg_ID (PK), Stud_id (FK), Event_id (FK), Status
 * Relationships: USER 1 --- N REGISTRATION N --- 1 EVENT
 */
@Entity
@Table(
        name = "registration",
        uniqueConstraints = @UniqueConstraint(
                name = "uq_registration_student_event",
                columnNames = {"stud_id", "event_id"}
        )
)
public class Registration {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "reg_id")
    private Long regId;

    /** ER: Stud_id (FK) -> USER */
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "stud_id", nullable = false)
    private User student;

    /** ER: Event_id (FK) -> EVENT */
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "event_id", nullable = false)
    private Event event;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false, length = 20)
    private RegistrationStatus status;

    public Registration() {
    }

    public Long getRegId() {
        return regId;
    }

    public void setRegId(Long regId) {
        this.regId = regId;
    }

    public User getStudent() {
        return student;
    }

    public void setStudent(User student) {
        this.student = student;
    }

    public Event getEvent() {
        return event;
    }

    public void setEvent(Event event) {
        this.event = event;
    }

    public RegistrationStatus getStatus() {
        return status;
    }

    public void setStatus(RegistrationStatus status) {
        this.status = status;
    }
}
