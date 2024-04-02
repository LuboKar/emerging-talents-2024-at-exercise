package com.filesystem.exception;

import javax.naming.AuthenticationException;

public class InvalidCredentialsException extends RuntimeException {
    public InvalidCredentialsException(String message){
        super(message);
    }
}
