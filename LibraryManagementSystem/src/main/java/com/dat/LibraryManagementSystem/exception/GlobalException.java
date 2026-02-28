package com.dat.LibraryManagementSystem.exception;

import com.dat.LibraryManagementSystem.payload.response.ApiResponse;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.bind.annotation.RestControllerAdvice;

@RestControllerAdvice
public class GlobalException{

    @ExceptionHandler(GenreException.class)
    public ResponseEntity<ApiResponse> handleGenreException(GenreException e){
        return  ResponseEntity.status(HttpStatus.BAD_REQUEST)
                .body( new ApiResponse(e.getMessage(), false));

    };
}
