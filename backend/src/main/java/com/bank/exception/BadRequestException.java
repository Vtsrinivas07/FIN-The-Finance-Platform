package com.bank.exception;

public class BadRequestException extends BankException {
    public BadRequestException(String message) {
        super(message);
    }
}
