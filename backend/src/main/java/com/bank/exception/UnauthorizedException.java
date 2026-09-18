package com.bank.exception;

public class UnauthorizedException extends BankException {
    public UnauthorizedException(String message) {
        super(message);
    }
}
