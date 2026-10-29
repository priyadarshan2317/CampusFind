package com.campusfind.backend.repository;

import com.campusfind.backend.entity.Item;
import com.campusfind.backend.entity.ItemStatus;
import com.campusfind.backend.entity.ItemType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;

import java.util.List;

public interface ItemRepository extends JpaRepository<Item, Long>, JpaSpecificationExecutor<Item> {

    List<Item> findByUserEmailOrderByCreatedAtDesc(String email);

    List<Item> findByStatusOrderByCreatedAtAsc(ItemStatus status);

    long countByStatus(ItemStatus status);

    long countByType(ItemType type);
}