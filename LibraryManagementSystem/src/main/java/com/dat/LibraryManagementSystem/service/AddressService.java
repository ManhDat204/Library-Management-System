package com.dat.LibraryManagementSystem.service;

import com.dat.LibraryManagementSystem.payload.dto.AddressDTO;
import com.dat.LibraryManagementSystem.payload.request.AddressRequest;

import java.util.List;

public interface AddressService {

    List<AddressDTO> getAll(Long userId);

    AddressDTO getById(Long addressId, Long userId);

    AddressDTO create(Long userId, AddressRequest.Create request);

    AddressDTO update(Long addressId, Long userId, AddressRequest.Update request);

    AddressDTO setDefault(Long addressId, Long userId);

    void delete(Long addressId, Long userId);
}