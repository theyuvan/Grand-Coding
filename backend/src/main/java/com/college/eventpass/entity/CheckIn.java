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
import jakarta.persistence.OneToOne;
import jakarta.persistence.Table;

/**
 * ER entity: CHECK-IN EVENT
 * Attributes: Check_In_Id (PK), Reg_id (FK), Check_Status
 * Relationship: REGISTRATION 1 --- 0..1 CHECK_IN
 * (the registration row already carries Student_id + Event_id from the ER)
 */
@Entity
@Table(name = "check_in_event")
public class CheckIn {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "check_in_id")
    private Long checkInId;

    /** ER: one registration has at most one check-in */
    @OneToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "reg_id", nullable = false, unique = true)
    private Registration registration;

    @Enumerated(EnumType.STRING)
    @Column(name = "check_status", nullable = false, length = 20)
    private CheckStatus checkStatus;

    public CheckIn() {
    }

    public Long getCheckInId() {
        return checkInId;
    }

    public void setCheckInId(Long checkInId) {
        this.checkInId = checkInId;
    }

    public Registration getRegistration() {
        return registration;
    }

    public void setRegistration(Registration registration) {
        this.registration = registration;
    }

    public CheckStatus getCheckStatus() {
        return checkStatus;
    }

    public void setCheckStatus(CheckStatus checkStatus) {
        this.checkStatus = checkStatus;
    }
}
