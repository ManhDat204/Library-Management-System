package com.dat.LibraryManagementSystem.repository;

import com.dat.LibraryManagementSystem.model.SubscriptionPlan;
import org.springframework.data.jpa.repository.JpaRepository;

public interface SubscriptionPlanRepository extends JpaRepository<SubscriptionPlan, Long> {
    Boolean existsByPlanCode(String planCode);
}
