package com.filesystem.controller;

import com.filesystem.dto.request.LoginRequest;
import com.filesystem.dto.request.RegisterRequest;
import com.filesystem.dto.response.AuthenticationResponse;
import com.filesystem.mapper.AuthenticationMapper;
import com.filesystem.model.User;
import com.filesystem.service.AuthenticationService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequiredArgsConstructor
@RequestMapping("/authentication")
public class AuthenticationController {

  private final AuthenticationService authenticationService;
  private final AuthenticationMapper authenticationMapper;

  @PostMapping("/register")
  public ResponseEntity<String> register(@RequestBody @Valid RegisterRequest registerRequest) {
    User registeredUser = authenticationMapper.toUserEntity(registerRequest);
    return ResponseEntity.ok(authenticationService.register(registeredUser));
  }

  @PostMapping("/login")
  public ResponseEntity<AuthenticationResponse> login(
      @RequestBody @Valid LoginRequest loginRequest) {
    return ResponseEntity.ok(authenticationService.login(loginRequest));
  }
}
