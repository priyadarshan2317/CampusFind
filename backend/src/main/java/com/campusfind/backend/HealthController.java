package com.campusfind.backend;

import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class HealthController {

    @GetMapping("/api/health")
    public String health() {
        return "CampusFind backend is running!";
    }

    @GetMapping("/api/me")
    public String me(Authentication authentication) {
        return "Logged in as: " + authentication.getName();
    }
}