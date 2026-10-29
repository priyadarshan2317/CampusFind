package com.campusfind.backend.service;

import com.campusfind.backend.dto.AuthResponse;
import com.campusfind.backend.dto.LoginRequest;
import com.campusfind.backend.dto.RegisterRequest;
import com.campusfind.backend.entity.Role;
import com.campusfind.backend.entity.User;
import com.campusfind.backend.repository.UserRepository;
import com.campusfind.backend.security.JwtUtil;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;

    public AuthService(UserRepository userRepository,
                       PasswordEncoder passwordEncoder,
                       JwtUtil jwtUtil) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtUtil = jwtUtil;
    }

    public AuthResponse register(RegisterRequest request) {
        String email = request.email().trim().toLowerCase();

        if (userRepository.existsByEmail(email)) {
            throw new IllegalArgumentException("Email is already registered");
        }

        User user = new User();
        user.setName(request.name().trim());
        user.setEmail(email);
        user.setPassword(passwordEncoder.encode(request.password()));
        user.setPhone(request.phone());
        user.setRole(Role.STUDENT);

        User saved = userRepository.save(user);
        return toResponse(saved);
    }

    public AuthResponse login(LoginRequest request) {
        String email = request.email().trim().toLowerCase();

        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new BadCredentialsException("Invalid email or password"));

        if (!passwordEncoder.matches(request.password(), user.getPassword())) {
            throw new BadCredentialsException("Invalid email or password");
        }

        return toResponse(user);
    }

    private AuthResponse toResponse(User user) {
        String token = jwtUtil.generateToken(user.getEmail(), user.getRole());
        return new AuthResponse(token, user.getId(), user.getName(), user.getEmail(), user.getRole());
    }
}