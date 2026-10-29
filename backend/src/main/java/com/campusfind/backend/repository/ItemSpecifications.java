package com.campusfind.backend.repository;

import com.campusfind.backend.entity.Item;
import com.campusfind.backend.entity.ItemStatus;
import com.campusfind.backend.entity.ItemType;
import jakarta.persistence.criteria.Predicate;
import org.springframework.data.jpa.domain.Specification;

import java.util.ArrayList;
import java.util.List;

public class ItemSpecifications {

    public static Specification<Item> filter(ItemStatus status, ItemType type, Long categoryId,
                                             String keyword, String location) {
        return (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();

            predicates.add(cb.equal(root.get("status"), status));

            if (type != null) {
                predicates.add(cb.equal(root.get("type"), type));
            }
            if (categoryId != null) {
                predicates.add(cb.equal(root.get("category").get("id"), categoryId));
            }
            if (keyword != null && !keyword.isBlank()) {
                String like = "%" + keyword.trim().toLowerCase() + "%";
                predicates.add(cb.or(
                        cb.like(cb.lower(root.get("title")), like),
                        cb.like(cb.lower(root.get("description")), like)));
            }
            if (location != null && !location.isBlank()) {
                String like = "%" + location.trim().toLowerCase() + "%";
                predicates.add(cb.like(cb.lower(root.get("location")), like));
            }

            return cb.and(predicates.toArray(new Predicate[0]));
        };
    }
}