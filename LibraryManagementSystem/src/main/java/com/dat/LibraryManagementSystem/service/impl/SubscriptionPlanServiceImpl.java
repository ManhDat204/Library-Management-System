package com.dat.LibraryManagementSystem.service.impl;

import com.dat.LibraryManagementSystem.exception.UserException;
import com.dat.LibraryManagementSystem.mapper.SubscriptionPlanMapper;
import com.dat.LibraryManagementSystem.model.SubscriptionPlan;
import com.dat.LibraryManagementSystem.model.User;
import com.dat.LibraryManagementSystem.payload.dto.SubscriptionPlanDTO;
import com.dat.LibraryManagementSystem.repository.SubscriptionPlanRepository;
import com.dat.LibraryManagementSystem.service.SubscriptionPlanService;
import com.dat.LibraryManagementSystem.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;


@Service
@RequiredArgsConstructor

public class SubscriptionPlanServiceImpl implements SubscriptionPlanService {

    private final SubscriptionPlanRepository planRepository;
    private final SubscriptionPlanMapper planMapper;
    private final UserService userService;
    @Override
    public SubscriptionPlanDTO createSubscriptionPlan(SubscriptionPlanDTO planDTO) throws Exception, UserException {
        if(planRepository.existsByPlanCode(planDTO.getPlanCode())){
            throw new Exception("Ma goi da ton tai");
        }
        SubscriptionPlan plan = planMapper.toEntity(planDTO);
        User currentUser = userService.getCurrentUser();
        plan.setCreatedBy(currentUser.getFullName());
        plan.setUpdatedBy(currentUser.getFullName());
        SubscriptionPlan savedPlan = planRepository.save(plan);

        return planMapper.toDTO(savedPlan);
    }

    @Override
    public SubscriptionPlanDTO updateSubscriptionPlan(Long planId, SubscriptionPlanDTO planDTO) throws Exception, UserException {
        SubscriptionPlan existingPlan = planRepository.findById(planId).orElseThrow(
                () -> new Exception("Goi khong ton tai")
        );
        planMapper.updateEntity(existingPlan , planDTO);
        User currentUser = userService.getCurrentUser();
        existingPlan.setUpdatedBy(currentUser.getFullName());
        SubscriptionPlan updatedPlan =planRepository.save(existingPlan);
        return planMapper.toDTO(updatedPlan);
    }

    @Override
    public void deleteSubscriptionPlan(Long planId) throws Exception {
        SubscriptionPlan existingPlan = planRepository.findById(planId).orElseThrow(
                () -> new Exception("Goi khong ton tai")
        );
        planRepository.delete(existingPlan);
    }

    @Override
    public List<SubscriptionPlanDTO> getAllSubscriptionPlan() {
        List<SubscriptionPlan> planList = planRepository.findAll();


        return planList.stream().map(
                planMapper::toDTO
        ).collect(Collectors.toList());
    }

    @Override
    public SubscriptionPlanDTO getSubscriptionPlan(Long planId) {
        return null;
    }
}
