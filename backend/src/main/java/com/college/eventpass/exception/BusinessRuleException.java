package com.college.eventpass.exception;

/** Thrown when a use-case rule is violated (duplicate registration, event full, ...). */
public class BusinessRuleException extends RuntimeException {

    public BusinessRuleException(String message) {
        super(message);
    }
}
