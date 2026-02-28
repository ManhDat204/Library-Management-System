package com.dat.LibraryManagementSystem.mapper;


import com.dat.LibraryManagementSystem.exception.SubscriptionException;
import com.dat.LibraryManagementSystem.model.Subscription;
import com.dat.LibraryManagementSystem.model.SubscriptionPlan;
import com.dat.LibraryManagementSystem.model.User;
import com.dat.LibraryManagementSystem.payload.dto.SubscriptionDTO;
import com.dat.LibraryManagementSystem.payload.dto.SubscriptionPlanDTO;
import com.dat.LibraryManagementSystem.repository.SubscriptionPlanRepository;
import com.dat.LibraryManagementSystem.repository.UserRepository;
import com.nimbusds.openid.connect.sdk.UserInfoResponse;
import lombok.RequiredArgsConstructor;
import org.apache.catalina.LifecycleState;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.stream.Collectors;

@Component
@RequiredArgsConstructor
public class SubscriptionMapper {

    private final UserRepository userRepository;
    private final SubscriptionPlanRepository planRepository;

    /**
     * ket noi tu entity sang DTO
     *
     */
    public SubscriptionDTO toDTO(Subscription subscription) {
        if (subscription == null) {
            return null;
        }
        SubscriptionDTO dto = new SubscriptionDTO();
        dto.setId((subscription.getId()));

        // thong tin user
        if (subscription.getUser() != null) {
            dto.setUserId(subscription.getUser().getId());
            dto.setUserName(subscription.getUser().getFullName());
            dto.setUserEmail(subscription.getUser().getEmail());
        }
        //Thong tin goi
        if (subscription.getPlan() != null) {
            dto.setPlanId(subscription.getPlan().getId());
        }
        dto.setPlanName(subscription.getPlanName());
        dto.setPlanCode(subscription.getPlanCode());
        dto.setPrice(subscription.getPrice());

        dto.setStartDate(subscription.getStartDate());
        dto.setEndDate(subscription.getEndDate());
        dto.setIsActive(subscription.getIsActive());
        dto.setMaxBooksAllowed(subscription.getMaxBooksAllowed());
        dto.setMaxDaysPerBook(subscription.getMaxDaysPerBook());
        dto.setAutoRenew(subscription.getAutoRenew());
        dto.setCancelledAt(subscription.getCancelledAt());
        dto.setCancellationReason(subscription.getCancellationReason());
        dto.setNotes(subscription.getNotes());
        dto.setCreatedAt(subscription.getCreatedAt());
        dto.setUpdatedAt(subscription.getUpdatedAt());

        dto.setDaysRemaining(subscription.getDaysRemaining());
        dto.setIsValid(subscription.isValid());
        dto.setIsExpired(subscription.isExpired());
        return dto;
    }

    public Subscription toEntity(SubscriptionDTO dto, SubscriptionPlan plan,  User user) throws SubscriptionException {
        if ((dto == null)) {
            return null;
        }
        Subscription subscription = new Subscription();
        subscription.setId(dto.getId());
        subscription.setUser(user);
        subscription.setPlan(plan);
        subscription.setNotes(dto.getNotes());
        return subscription;

    }

    //ket noi danh sach subscription sangg DTO

    public List<SubscriptionDTO> toDTOList(List<Subscription> subscriptions){
        if(subscriptions ==null){
            return  null;
        }
        return subscriptions.stream().map(this::toDTO).collect(Collectors.toList());
    }
}



