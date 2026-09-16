package com.college.eventpass.repository;

/** Projection for the SQL task: Event Name + Total Registrations. */
public interface TopEventProjection {

    String getEventName();

    Long getTotalRegistrations();
}
