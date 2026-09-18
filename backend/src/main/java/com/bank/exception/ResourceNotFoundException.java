package com.bank.exception;

public class ResourceNotFoundException extends BankException {
    public ResourceNotFoundException(String message) {
        super(message);
    }
}
