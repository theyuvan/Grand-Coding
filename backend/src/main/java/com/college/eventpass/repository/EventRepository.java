package com.college.eventpass.repository;

import com.college.eventpass.entity.Event;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface EventRepository extends JpaRepository<Event, Long> {

    List<Event> findAllByOrderByEventDateAsc(); 

    List<Event> findByOrganizerUserIdOrderByEventDateAsc(Long organizerId);
}
