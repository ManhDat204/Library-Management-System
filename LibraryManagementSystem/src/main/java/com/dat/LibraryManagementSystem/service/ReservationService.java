package com.dat.LibraryManagementSystem.service;

import com.dat.LibraryManagementSystem.exception.UserException;
import com.dat.LibraryManagementSystem.payload.dto.ReservationDTO;
import com.dat.LibraryManagementSystem.payload.request.ReservationRequest;
import com.dat.LibraryManagementSystem.payload.request.ReservationSearchRequest;
import com.dat.LibraryManagementSystem.payload.response.PageResponse;



public interface ReservationService {
    ReservationDTO createReservation(ReservationRequest reservationRequest) throws Exception;

    ReservationDTO createReservationForUser(ReservationRequest reservationRequest, Long userId) throws Exception;

    ReservationDTO cancelReservation(Long reservationId) throws Exception;

    ReservationDTO fulfillReservation(Long reservationId) throws Exception;

    PageResponse<ReservationDTO> getMyReservations(ReservationSearchRequest searchRequest) throws UserException;

    PageResponse<ReservationDTO> searchReservations(ReservationSearchRequest searchRequest);
}
