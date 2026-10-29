package com.campusfind.backend.repository;

import com.campusfind.backend.entity.Category;
import org.springframework.data.jpa.repository.JpaRepository;

public interface CategoryRepository extends JpaRepository<Category, Long> {

    boolean existsByName(String name);
}