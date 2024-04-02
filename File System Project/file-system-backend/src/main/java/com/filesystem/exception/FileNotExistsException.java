package com.filesystem.exception;

public class FileNotExistsException extends RuntimeException{
    public FileNotExistsException(){
        super("File does not exists!");
    }
}
