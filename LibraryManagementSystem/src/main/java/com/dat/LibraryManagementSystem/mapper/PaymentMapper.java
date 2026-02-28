package com.dat.LibraryManagementSystem.mapper;

import com.dat.LibraryManagementSystem.model.Payment;
import com.dat.LibraryManagementSystem.payload.dto.PaymentDTO;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.stream.Collectors;

@Component
@RequiredArgsConstructor
public class PaymentMapper {

    public PaymentDTO toDTO(Payment p) {
        if (p == null) {
            return null;
        }
        PaymentDTO dto = new PaymentDTO();
        dto.setId(p.getId());
        if (p.getUser() != null) {
            dto.setUserId(p.getUser().getId());
            dto.setUserName(p.getUser().getFullName());
            dto.setUserEmail(p.getUser().getEmail());
        }
        if (p.getSubscription() != null) {
            dto.setSubscriptionId(p.getSubscription().getId());
        }
        dto.setPaymentType(p.getPaymentType());
        dto.setPaymentStatus(p.getPaymentStatus());
        dto.setGateway(p.getGateway());
        dto.setAmount(p.getAmount());
        dto.setTxnRef(p.getTxnRef());
        dto.setTransactionId(p.getTransactionId());
        dto.setSecureHash(p.getSecureHash());
        dto.setDescription(p.getDescription());
        dto.setFailureReason(p.getFailureReason());
        dto.setInitiatedAt(p.getInitiatedAt());
        dto.setCompletedAt(p.getCompletedAt());
        dto.setCreatedAt(p.getCreatedAt());
        dto.setUpdatedAt(p.getUpdatedAt());
        return dto;
    }

    public Payment toEntity(PaymentDTO dto) {
        if (dto == null) {
            return null;
        }
        Payment p = new Payment();
        p.setId(dto.getId());
        // user and subscription references should be set by caller if needed
        p.setPaymentType(dto.getPaymentType());
        p.setPaymentStatus(dto.getPaymentStatus());
        p.setGateway(dto.getGateway());
        p.setAmount(dto.getAmount());
        p.setTxnRef(dto.getTxnRef());
        p.setTransactionId(dto.getTransactionId());
        p.setSecureHash(dto.getSecureHash());
        p.setDescription(dto.getDescription());
        p.setFailureReason(dto.getFailureReason());
        p.setInitiatedAt(dto.getInitiatedAt());
        p.setCompletedAt(dto.getCompletedAt());
        return p;
    }

    public List<PaymentDTO> toDTOList(List<Payment> list) {
        if (list == null) {
            return null;
        }
        return list.stream().map(this::toDTO).collect(Collectors.toList());
    }
}
