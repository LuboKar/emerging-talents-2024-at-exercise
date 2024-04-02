package com.filesystem.service;

import com.filesystem.exception.AlreadyUsedEmailException;
import com.filesystem.exception.InvalidCredentialsException;
import com.filesystem.exception.UserNotFoundException;
import com.filesystem.repository.UserRepository;
import com.google.gson.Gson;
import com.filesystem.dto.request.LoginRequest;
import com.filesystem.dto.response.AuthenticationResponse;
import com.filesystem.model.Role;
import com.filesystem.model.User;

import java.io.File;
import java.util.Optional;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class AuthenticationService {
  private static final String USER_CREATED_SUCCESSFULLY =
      "User with email %s was created successfully!";

  private static final String MY_PERSONAL_FILES = "MyPersonalFiles";

  private final PasswordEncoder passwordEncoder;
  private final UserRepository userRepository;
  private final AuthenticationManager authenticationManager;
  private final JwtService jwtService;
  private final UserDetailsService userDetailsService;

  public String register(User registerdUser) {
    validateUserEmail(registerdUser);

    registerdUser.setRole(Role.USER);
    registerdUser.setPassword(passwordEncoder.encode(registerdUser.getPassword()));

    userRepository.save(registerdUser);

    createUserFolder(registerdUser.getEmail());

    String response = String.format(USER_CREATED_SUCCESSFULLY, registerdUser.getEmail());
    Gson gson = new Gson();
    return gson.toJson(response);
  }

  public AuthenticationResponse login(LoginRequest loginRequest) {
    authentication(loginRequest);
    User user = findUserByEmail(loginRequest.getEmail());
    String jwtToken = jwtService.generateToken(user);
    return AuthenticationResponse.builder().token(jwtToken).build();
  }

  public String getCurrentUser() {
    Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
    return authentication.getName();
  }

  private void validateUserEmail(User user) {
    Optional<User> savedUser = userRepository.findByEmail(user.getEmail());
    if (savedUser.isPresent()) throw new AlreadyUsedEmailException();
  }

  private void createUserFolder(String userEmail) {
    File folder = new File(MY_PERSONAL_FILES + "\\" + userEmail);
    if (!folder.exists()) {
      boolean created = folder.mkdirs();
    }
  }

  private User findUserByEmail(String email) {
    return userRepository.findByEmail(email).orElseThrow(() -> new UserNotFoundException(email));
  }

  private void authentication(LoginRequest loginRequest) {
    try {
      authenticationManager.authenticate(
          new UsernamePasswordAuthenticationToken(
              loginRequest.getEmail(), loginRequest.getPassword()));
    } catch (AuthenticationException e) {
      throw new InvalidCredentialsException("Wrong email or password!");
    }
  }
}
