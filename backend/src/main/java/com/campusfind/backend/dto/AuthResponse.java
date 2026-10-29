package com.campusfind.backend.dto;

import com.campusfind.backend.entity.Role;

public record AuthResponse(
        String token,
        Long id,
        String name,
        String email,
        Role role
) {}