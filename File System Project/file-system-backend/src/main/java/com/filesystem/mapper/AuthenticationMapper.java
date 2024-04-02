package com.filesystem.mapper;

import com.filesystem.dto.request.RegisterRequest;
import com.filesystem.model.User;
import lombok.RequiredArgsConstructor;
import org.modelmapper.ModelMapper;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class AuthenticationMapper {
  private final ModelMapper modelMapper;

  public User toUserEntity(RegisterRequest registerRequest) {
    return modelMapper.map(registerRequest, User.class);
  }
}
