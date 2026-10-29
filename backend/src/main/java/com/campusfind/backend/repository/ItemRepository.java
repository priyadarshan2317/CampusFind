package com.campusfind.backend.repository;

import com.campusfind.backend.entity.Item;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ItemRepository extends JpaRepository<Item, Long> {
}