package com.campusfind.backend.dto;

import com.campusfind.backend.entity.ItemStatus;
import com.campusfind.backend.entity.ItemType;

import java.time.LocalDate;
import java.time.LocalDateTime;

public record ItemResponse(
        Long id,
        String title,
        String description,
        ItemType type,
        Long categoryId,
        String categoryName,
        String location,
        LocalDate dateReported,
        String imageUrl,
        ItemStatus status,
        Long postedById,
        String postedByName,
        String postedByEmail,
        String postedByPhone,
        LocalDateTime createdAt
) {}