package com.dat.LibraryManagementSystem.service;

import com.dat.LibraryManagementSystem.exception.UserException;
import com.dat.LibraryManagementSystem.model.SubscriptionPlan;
import com.dat.LibraryManagementSystem.payload.dto.SubscriptionPlanDTO;

import java.util.List;

public interface SubscriptionPlanService {

    SubscriptionPlanDTO createSubscriptionPlan(SubscriptionPlanDTO planDTO) throws Exception, UserException;

    SubscriptionPlanDTO updateSubscriptionPlan(Long planId, SubscriptionPlanDTO planDTO) throws Exception, UserException;


    void deleteSubscriptionPlan(Long planId) throws Exception;

    List<SubscriptionPlanDTO> getAllSubscriptionPlan();

    SubscriptionPlanDTO getSubscriptionPlan(Long planId) ;
}
