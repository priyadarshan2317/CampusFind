package com.campusfind.backend.controller;

import com.campusfind.backend.dto.ItemResponse;
import com.campusfind.backend.dto.StatsResponse;
import com.campusfind.backend.service.ItemService;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin")
public class AdminController {

    private final ItemService itemService;

    public AdminController(ItemService itemService) {
        this.itemService = itemService;
    }

    @GetMapping("/pending")
    public List<ItemResponse> pending() {
        return itemService.pendingItems();
    }

    @PatchMapping("/items/{id}/approve")
    public ItemResponse approve(@PathVariable Long id) {
        return itemService.approve(id);
    }

    @PatchMapping("/items/{id}/reject")
    public ItemResponse reject(@PathVariable Long id) {
        return itemService.reject(id);
    }

    @GetMapping("/stats")
    public StatsResponse stats() {
        return itemService.stats();
    }
}