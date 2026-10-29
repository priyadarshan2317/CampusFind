package com.campusfind.backend.controller;

import com.campusfind.backend.dto.ItemRequest;
import com.campusfind.backend.dto.ItemResponse;
import com.campusfind.backend.entity.ItemType;
import com.campusfind.backend.service.ItemService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/items")
public class ItemController {

    private final ItemService itemService;

    public ItemController(ItemService itemService) {
        this.itemService = itemService;
    }

    @PostMapping
    public ResponseEntity<ItemResponse> create(@Valid @RequestBody ItemRequest request,
                                               Authentication auth) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(itemService.create(request, auth.getName()));
    }

    @GetMapping
    public List<ItemResponse> search(@RequestParam(required = false) ItemType type,
                                     @RequestParam(required = false) Long categoryId,
                                     @RequestParam(required = false) String keyword,
                                     @RequestParam(required = false) String location) {
        return itemService.search(type, categoryId, keyword, location);
    }

    @GetMapping("/my")
    public List<ItemResponse> myItems(Authentication auth) {
        return itemService.myItems(auth.getName());
    }

    @GetMapping("/{id}")
    public ItemResponse get(@PathVariable Long id, Authentication auth) {
        return itemService.get(id, auth.getName(), isAdmin(auth));
    }

    @PutMapping("/{id}")
    public ItemResponse update(@PathVariable Long id,
                               @Valid @RequestBody ItemRequest request,
                               Authentication auth) {
        return itemService.update(id, request, auth.getName());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id, Authentication auth) {
        itemService.delete(id, auth.getName(), isAdmin(auth));
        return ResponseEntity.noContent().build();
    }

    @PatchMapping("/{id}/claim")
    public ItemResponse claim(@PathVariable Long id, Authentication auth) {
        return itemService.claim(id, auth.getName());
    }

    private boolean isAdmin(Authentication auth) {
        return auth.getAuthorities().stream()
                .anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN"));
    }
}