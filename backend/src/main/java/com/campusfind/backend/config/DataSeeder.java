package com.campusfind.backend.config;

import com.campusfind.backend.entity.Category;
import com.campusfind.backend.repository.CategoryRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.util.List;

@Configuration
public class DataSeeder {

    @Bean
    CommandLineRunner seedCategories(CategoryRepository categoryRepository) {
        return args -> {
            List<String> names = List.of(
                    "Phone", "ID Card", "Wallet", "Keys",
                    "Books", "Bag", "Electronics", "Others");

            for (String name : names) {
                if (!categoryRepository.existsByName(name)) {
                    categoryRepository.save(new Category(name));
                }
            }
        };
    }
}