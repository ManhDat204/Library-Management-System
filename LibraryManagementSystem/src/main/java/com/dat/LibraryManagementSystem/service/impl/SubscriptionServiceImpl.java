package com.dat.LibraryManagementSystem.service.impl;

import com.dat.LibraryManagementSystem.exception.SubscriptionException;
import com.dat.LibraryManagementSystem.exception.UserException;
import com.dat.LibraryManagementSystem.mapper.SubscriptionMapper;
import com.dat.LibraryManagementSystem.model.Subscription;
import com.dat.LibraryManagementSystem.model.SubscriptionPlan;
import com.dat.LibraryManagementSystem.model.User;
import com.dat.LibraryManagementSystem.payload.dto.SubscriptionDTO;
import com.dat.LibraryManagementSystem.repository.SubscriptionPlanRepository;
import com.dat.LibraryManagementSystem.repository.SubscriptionRepository;
import com.dat.LibraryManagementSystem.service.SubscriptionService;
import com.dat.LibraryManagementSystem.service.UserService;
import com.dat.LibraryManagementSystem.service.PaymentService;
import com.dat.LibraryManagementSystem.domain.PaymentType;
import com.dat.LibraryManagementSystem.domain.PaymentStatus;
import com.dat.LibraryManagementSystem.model.Payment;
import com.dat.LibraryManagementSystem.payload.dto.PaymentDTO;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Slf4j
@Service
@RequiredArgsConstructor
public class SubscriptionServiceImpl implements SubscriptionService {

    private final SubscriptionPlanRepository subscriptionPlanRepository;
    private final SubscriptionMapper subscriptionMapper;
    private final UserService userService;
    private final SubscriptionRepository subscriptionRepository;
    private final PaymentService paymentService;

    @Override
    public SubscriptionDTO subscribe(SubscriptionDTO subscriptionDTO) throws UserException, Exception {
        User user = userService.getCurrentUser();
        SubscriptionPlan plan = subscriptionPlanRepository
                .findById(subscriptionDTO.getPlanId()).orElseThrow(
                        ()-> new Exception("Gói khong ton tai")
                );
        Optional<Subscription> existingActive = subscriptionRepository
            .findActiveSubscriptionByUserId(user.getId(), LocalDate.now());
        if (existingActive.isPresent()) {
            throw new SubscriptionException("Bạn đang có gói đang hoạt động. Vui lòng huỷ gói hiện tại trước.");
        }

        Subscription subscription = subscriptionMapper.toEntity(subscriptionDTO, plan, user);
        subscription.initializeFromPlan();
        subscription.setIsActive(false);

        Subscription savedSubscription = subscriptionRepository.save(subscription);

        try {
            PaymentDTO paymentDto = PaymentDTO.builder()
                    .userId(user.getId())
                    .subscriptionId(savedSubscription.getId())
                    .paymentType(PaymentType.MEMBERSHIP)
                    .paymentStatus(PaymentStatus.PENDING)
                    .amount(savedSubscription.getPrice())
                    .txnRef("SUBS" + savedSubscription.getId() + "-" + System.currentTimeMillis())
                    .description("Phí đăng ký  " + plan.getName())
                    .build();
            PaymentDTO savedPayment = paymentService.createPayment(paymentDto);


            savedSubscription.setNotes("paymentId=" + savedPayment.getId());
            savedSubscription = subscriptionRepository.save(savedSubscription);
            return subscriptionMapper.toDTO(savedSubscription);
        } catch (Exception e) {
            log.error("failed to create payment record", e);
        }

        return subscriptionMapper.toDTO(savedSubscription);
    }

    @Override
    public SubscriptionDTO getUsersActiveSubscription(Long userId) throws SubscriptionException, UserException {
        User user = userService.getCurrentUser();

        return subscriptionRepository
                .findActiveSubscriptionByUserId(user.getId(), LocalDate.now())
                .map(subscriptionMapper::toDTO)
                .orElse(null);
    }

    @Override
    public SubscriptionDTO cancelSubscription(Long subscriptionId, String reason) throws SubscriptionException {

        Subscription subscription = subscriptionRepository.findById(subscriptionId)
                .orElseThrow(() -> new SubscriptionException(
                        "Subscription khong ton tai voi ID" + subscriptionId));
        if(!subscription.getIsActive()){
            throw new SubscriptionException("Subscription da san sang active");
        }
        subscription.setIsActive(false);
        subscription.setCancelledAt(LocalDateTime.now());
        subscription.setCancellationReason(reason != null ? reason : " Cancel boi nguoi dung");

        subscription = subscriptionRepository.save(subscription);

        return subscriptionMapper.toDTO(subscription);
    }

    @Override
    public SubscriptionDTO activateSubscription(Long subscriptionId, Long paymentId) throws SubscriptionException {
        Subscription subscription = subscriptionRepository.findById(subscriptionId).orElseThrow(
                () -> new SubscriptionException("Subscription khong ton tai voi ID")
        );
       
        try {
            paymentService.verifyPayment(paymentId);
        } catch (Exception e) {
            throw new SubscriptionException("Payment verification failed: " + e.getMessage());
        }
        subscription.setIsActive(true);
        subscription = subscriptionRepository.save(subscription);
        return subscriptionMapper.toDTO(subscription);

    }

    @Override
    public Page<SubscriptionDTO> getAllSubscriptions(Pageable pageable) {
        return subscriptionRepository.findAll(pageable)
                .map(subscriptionMapper::toDTO);
    }



    @Override
    public void deactivateExpiredSubscriptions() throws Exception {
        List<Subscription> expiredSubscriptions =  subscriptionRepository
                .findExpiredActiveSubscriptions(LocalDate.now());
        for(Subscription subscription : expiredSubscriptions){
            subscription.setIsActive(false);
            subscriptionRepository.save(subscription);
        }
    }


    @Override
    public Page<SubscriptionDTO> getRecentSubscriptions(Pageable pageable) {
        return subscriptionRepository
                .findRecentSubscriptions(pageable)
                .map(subscriptionMapper::toDTO);
    }
}
