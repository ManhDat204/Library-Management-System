package com.dat.LibraryManagementSystem.service.impl;

import com.dat.LibraryManagementSystem.mapper.AddressMapper;
import com.dat.LibraryManagementSystem.model.Address;
import com.dat.LibraryManagementSystem.model.User;
import com.dat.LibraryManagementSystem.payload.dto.AddressDTO;
import com.dat.LibraryManagementSystem.payload.request.AddressRequest;
import com.dat.LibraryManagementSystem.repository.AddressRepository;
import com.dat.LibraryManagementSystem.repository.UserRepository;
import com.dat.LibraryManagementSystem.service.AddressService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AddressServiceImpl implements AddressService {

    private static final int MAX_ADDRESSES = 5;

    private final AddressRepository addressRepository;
    private final UserRepository userRepository;
    private final AddressMapper addressMapper;

    @Override
    public List<AddressDTO> getAll(Long userId) {
        getUser(userId);
        return addressRepository
                .findByUserIdOrderByIsDefaultDescCreatedAtDesc(userId)
                .stream()
                .map(addressMapper::toDTO)
                .collect(Collectors.toList());
    }

    @Override
    public AddressDTO getById(Long addressId, Long userId) {
        return addressMapper.toDTO(findAddress(addressId, userId));
    }

    @Override
    @Transactional
    public AddressDTO create(Long userId, AddressRequest.Create req) {
        User user = getUser(userId);

        if (addressRepository.countByUserId(userId) >= MAX_ADDRESSES)
            throw new RuntimeException("Chỉ được lưu tối đa " + MAX_ADDRESSES + " địa chỉ");

        // Địa chỉ đầu tiên hoặc chủ động đặt mặc định → reset các địa chỉ cũ
        boolean isFirst = addressRepository.countByUserId(userId) == 0;
        if (Boolean.TRUE.equals(req.getIsDefault()) || isFirst) {
            addressRepository.resetDefaultByUserId(userId);
            req.setIsDefault(true);
        }

        Address address = Address.builder()
                .user(user)
                .recipientName(req.getRecipientName())
                .phoneNumber(req.getPhoneNumber())
                .province(req.getProvince())
                .district(req.getDistrict())
                .ward(req.getWard())
                .isDefault(req.getIsDefault())
                .createdAt(LocalDateTime.now())
                .updatedAt(LocalDateTime.now())
                .build();

        return addressMapper.toDTO(addressRepository.save(address));
    }

    @Override
    @Transactional
    public AddressDTO update(Long addressId, Long userId, AddressRequest.Update req) {
        Address address = findAddress(addressId, userId);

        if (req.getRecipientName() != null) address.setRecipientName(req.getRecipientName());
        if (req.getPhoneNumber() != null)   address.setPhoneNumber(req.getPhoneNumber());
        if (req.getProvince() != null)      address.setProvince(req.getProvince());
        if (req.getDistrict() != null)      address.setDistrict(req.getDistrict());
        if (req.getWard() != null)          address.setWard(req.getWard());

        if (Boolean.TRUE.equals(req.getIsDefault()) && !address.getIsDefault()) {
            addressRepository.resetDefaultByUserId(userId);
            address.setIsDefault(true);
        }

        address.setUpdatedAt(LocalDateTime.now());
        return addressMapper.toDTO(addressRepository.save(address));
    }

    @Override
    @Transactional
    public AddressDTO setDefault(Long addressId, Long userId) {
        Address address = findAddress(addressId, userId);
        addressRepository.resetDefaultByUserId(userId);
        address.setIsDefault(true);
        address.setUpdatedAt(LocalDateTime.now());
        return addressMapper.toDTO(addressRepository.save(address));
    }

    @Override
    @Transactional
    public void delete(Long addressId, Long userId) {
        Address address = findAddress(addressId, userId);
        boolean wasDefault = Boolean.TRUE.equals(address.getIsDefault());
        addressRepository.delete(address);


        if (wasDefault) {
            addressRepository
                    .findByUserIdOrderByIsDefaultDescCreatedAtDesc(userId)
                    .stream().findFirst().ifPresent(a -> {
                        a.setIsDefault(true);
                        addressRepository.save(a);
                    });
        }
    }



    private User getUser(Long userId) {
        return userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy user: " + userId));
    }

    private Address findAddress(Long addressId, Long userId) {
        return addressRepository.findByIdAndUserId(addressId, userId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy địa chỉ: " + addressId));
    }
}