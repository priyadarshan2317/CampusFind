package com.campusfind.backend.dto;

public record StatsResponse(
        long totalItems,
        long pending,
        long approved,
        long claimed,
        long rejected,
        long lostItems,
        long foundItems,
        long totalUsers
) {}