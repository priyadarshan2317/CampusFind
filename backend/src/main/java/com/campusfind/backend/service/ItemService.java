package com.campusfind.backend.service;

import com.campusfind.backend.dto.ItemRequest;
import com.campusfind.backend.dto.ItemResponse;
import com.campusfind.backend.entity.*;
import com.campusfind.backend.exception.ResourceNotFoundException;
import com.campusfind.backend.repository.CategoryRepository;
import com.campusfind.backend.repository.ItemRepository;
import com.campusfind.backend.repository.ItemSpecifications;
import com.campusfind.backend.repository.UserRepository;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class ItemService {

    private final ItemRepository itemRepository;
    private final CategoryRepository categoryRepository;
    private final UserRepository userRepository;

    public ItemService(ItemRepository itemRepository,
                       CategoryRepository categoryRepository,
                       UserRepository userRepository) {
        this.itemRepository = itemRepository;
        this.categoryRepository = categoryRepository;
        this.userRepository = userRepository;
    }

    @Transactional
    public ItemResponse create(ItemRequest request, String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        Item item = new Item();
        item.setUser(user);
        applyRequest(item, request);
        return toResponse(itemRepository.save(item));
    }

    @Transactional(readOnly = true)
    public List<ItemResponse> search(ItemType type, Long categoryId, String keyword, String location) {
        Specification<Item> spec =
                ItemSpecifications.filter(ItemStatus.APPROVED, type, categoryId, keyword, location);

        return itemRepository.findAll(spec, Sort.by(Sort.Direction.DESC, "createdAt"))
                .stream()
                .map(this::toResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public ItemResponse get(Long id, String email, boolean isAdmin) {
        Item item = findItem(id);

        boolean publicItem = item.getStatus() == ItemStatus.APPROVED
                || item.getStatus() == ItemStatus.CLAIMED;
        boolean owner = item.getUser().getEmail().equals(email);

        if (!publicItem && !owner && !isAdmin) {
            throw new ResourceNotFoundException("Item not found");
        }
        return toResponse(item);
    }

    @Transactional(readOnly = true)
    public List<ItemResponse> myItems(String email) {
        return itemRepository.findByUserEmailOrderByCreatedAtDesc(email)
                .stream()
                .map(this::toResponse)
                .toList();
    }

    @Transactional
    public ItemResponse update(Long id, ItemRequest request, String email) {
        Item item = findItem(id);
        requireOwner(item, email);

        if (item.getStatus() == ItemStatus.CLAIMED) {
            throw new IllegalArgumentException("Claimed items cannot be edited");
        }

        applyRequest(item, request);
        item.setStatus(ItemStatus.PENDING);   // an edited post needs approval again
        return toResponse(itemRepository.save(item));
    }

    @Transactional
    public void delete(Long id, String email, boolean isAdmin) {
        Item item = findItem(id);
        if (!isAdmin) {
            requireOwner(item, email);
        }
        itemRepository.delete(item);
    }

    @Transactional
    public ItemResponse claim(Long id, String email) {
        Item item = findItem(id);
        requireOwner(item, email);

        if (item.getStatus() != ItemStatus.APPROVED) {
            throw new IllegalArgumentException("Only approved items can be marked as claimed");
        }

        item.setStatus(ItemStatus.CLAIMED);
        return toResponse(itemRepository.save(item));
    }

    // ---------- helper methods ----------

    private Item findItem(Long id) {
        return itemRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Item not found"));
    }

    private void requireOwner(Item item, String email) {
        if (!item.getUser().getEmail().equals(email)) {
            throw new AccessDeniedException("You can only change your own posts");
        }
    }

    private void applyRequest(Item item, ItemRequest request) {
        Category category = categoryRepository.findById(request.categoryId())
                .orElseThrow(() -> new IllegalArgumentException("Invalid category"));

        item.setTitle(request.title().trim());
        item.setDescription(request.description());
        item.setType(request.type());
        item.setCategory(category);
        item.setLocation(request.location().trim());
        item.setDateReported(request.dateReported());
        item.setImageUrl(request.imageUrl());
    }

    private ItemResponse toResponse(Item item) {
        return new ItemResponse(
                item.getId(),
                item.getTitle(),
                item.getDescription(),
                item.getType(),
                item.getCategory().getId(),
                item.getCategory().getName(),
                item.getLocation(),
                item.getDateReported(),
                item.getImageUrl(),
                item.getStatus(),
                item.getUser().getId(),
                item.getUser().getName(),
                item.getUser().getEmail(),
                item.getUser().getPhone(),
                item.getCreatedAt());
    }
}