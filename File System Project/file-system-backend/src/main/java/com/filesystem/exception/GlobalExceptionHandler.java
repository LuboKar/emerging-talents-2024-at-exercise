package com.filesystem.exception;

import com.google.gson.Gson;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.BindingResult;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ControllerAdvice;
import org.springframework.web.bind.annotation.ExceptionHandler;

import java.util.HashMap;
import java.util.Map;

@ControllerAdvice
public class GlobalExceptionHandler {

  @ExceptionHandler(RuntimeException.class)
  public ResponseEntity<Map<String, String>> handleException(RuntimeException exception) {
    Map<String, String> responseBody = new HashMap<>();
    responseBody.put("error", exception.getMessage());
    return ResponseEntity.badRequest().body(responseBody);
  }

  @ExceptionHandler(MethodArgumentNotValidException.class)
  public ResponseEntity<Map<String, String>> handleValidationExceptions(
      MethodArgumentNotValidException methodArgumentNotValidException) {
    BindingResult result = methodArgumentNotValidException.getBindingResult();
    Map<String, String> errors = new HashMap<>();

    for (FieldError error : result.getFieldErrors()) {
      errors.put(error.getField(), error.getDefaultMessage());
    }

    return ResponseEntity.badRequest().body(errors);
  }
}
