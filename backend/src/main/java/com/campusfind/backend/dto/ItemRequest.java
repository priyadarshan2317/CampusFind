package com.campusfind.backend.dto;

import com.campusfind.backend.entity.ItemType;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.PastOrPresent;
import jakarta.validation.constraints.Size;

import java.time.LocalDate;

public record ItemRequest(
        @NotBlank(message = "Title is required") @Size(max = 100, message = "Title is too long") String title,
        @Size(max = 1000, message = "Description is too long") String description,
        @NotNull(message = "Type (LOST or FOUND) is required") ItemType type,
        @NotNull(message = "Category is required") Long categoryId,
        @NotBlank(message = "Location is required") String location,
        @NotNull(message = "Date is required") @PastOrPresent(message = "Date cannot be in the future") LocalDate dateReported,
        String imageUrl
) {}