package com.dat.LibraryManagementSystem.service;

import com.dat.LibraryManagementSystem.exception.SubscriptionException;
import com.dat.LibraryManagementSystem.exception.UserException;
import com.dat.LibraryManagementSystem.payload.dto.SubscriptionDTO;
import org.springframework.data.domain.Pageable;

import java.util.List;

public interface SubscriptionService {
    SubscriptionDTO subscribe(SubscriptionDTO subscriptionDTO) throws UserException, Exception;

    SubscriptionDTO getUsersActiveSubscription(Long  userId) throws SubscriptionException, UserException;

    SubscriptionDTO cancelSubscription(Long subscriptionId, String reason) throws SubscriptionException;

    SubscriptionDTO activateSubscription(Long subscriptionId, Long paymentId) throws SubscriptionException;

    List<SubscriptionDTO> getAllSubscriptions(Pageable pageable);

    void deactivateExpiredSubscriptions() throws Exception;

}
