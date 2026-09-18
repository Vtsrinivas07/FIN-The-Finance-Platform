package com.bank.repository;

import com.bank.entity.SupportFAQ;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface SupportFAQRepository extends JpaRepository<SupportFAQ, Long> {
    List<SupportFAQ> findByCategory(String category);

    @Query("SELECT f FROM SupportFAQ f WHERE " +
           "LOWER(f.question) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
           "LOWER(f.answer) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
           "LOWER(f.keywords) LIKE LOWER(CONCAT('%', :query, '%'))")
    List<SupportFAQ> searchFaq(@Param("query") String query);
}
