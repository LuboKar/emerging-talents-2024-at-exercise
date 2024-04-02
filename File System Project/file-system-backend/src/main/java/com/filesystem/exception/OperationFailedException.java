package com.filesystem.exception;

public class OperationFailedException extends RuntimeException{
    public OperationFailedException(){
        super("Operation failed!");
    }
}
