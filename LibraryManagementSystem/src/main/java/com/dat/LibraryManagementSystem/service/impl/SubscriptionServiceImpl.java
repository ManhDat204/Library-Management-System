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

        //  Optional<sub>

        Subscription subscription = subscriptionMapper.toEntity(subscriptionDTO, plan, user);
        subscription.initializeFromPlan();
        subscription.setIsActive(false);

        Subscription savedSubscription = subscriptionRepository.save(subscription);
        // create a payment record for the newly created subscription
        try {
            PaymentDTO paymentDto = PaymentDTO.builder()
                    .userId(user.getId())
                    .subscriptionId(savedSubscription.getId())
                    .paymentType(PaymentType.MEMBERSHIP)
                    .paymentStatus(PaymentStatus.PENDING)
                    .amount(savedSubscription.getPrice())
                    .txnRef("SUBS" + savedSubscription.getId() + "-" + System.currentTimeMillis())
                    .description("Phí đăng ký gói " + plan.getName())
                    .build();
            PaymentDTO savedPayment = paymentService.createPayment(paymentDto);

            // optionally include payment id in response notes so client can use it
            savedSubscription.setNotes("paymentId=" + savedPayment.getId());
            savedSubscription = subscriptionRepository.save(savedSubscription);// thêm dòng này

            return subscriptionMapper.toDTO(savedSubscription); // trả về sau khi đã có notes
        } catch (Exception e) {
            log.error("failed to create payment record", e);
        }

        return subscriptionMapper.toDTO(savedSubscription);
    }

    @Override
    public SubscriptionDTO getUsersActiveSubscription(Long userId) throws SubscriptionException, UserException {
        User user = userService.getCurrentUser();

        Subscription subscription = subscriptionRepository
                .findActiveSubscriptionByUserId(user.getId(), LocalDate.now())
                .orElseThrow(()-> new SubscriptionException("Bạn chưa đăng ký gói để có thể mượn sách"));
        return subscriptionMapper.toDTO(subscription);
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
        // verify payment using payment service
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
    public List<SubscriptionDTO> getAllSubscriptions(Pageable pageable) {
        List<Subscription>  subscriptions = subscriptionRepository.findAll();
        return subscriptionMapper.toDTOList(subscriptions);
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
}
