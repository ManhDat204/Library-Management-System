package com.dat.LibraryManagementSystem.payload.request;

import jakarta.validation.constraints.*;
import lombok.*;

public class AddressRequest {

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class Create {

        @NotBlank(message = "Tên người nhận không được để trống")
        @Size(max = 100, message = "Tên người nhận không quá 100 ký tự")
        private String recipientName;

        @NotBlank(message = "Số điện thoại không được để trống")
        @Pattern(regexp = "^(0|\\+84)[0-9]{9}$", message = "Số điện thoại không hợp lệ")
        private String phoneNumber;

        @NotBlank(message = "Tỉnh/Thành phố không được để trống")
        private String province;

        @NotBlank(message = "Quận/Huyện không được để trống")
        private String district;

        @NotBlank(message = "Phường/Xã không được để trống")
        private String ward;

        @Builder.Default
        private Boolean isDefault = false;
    }

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class Update {

        @Size(max = 100, message = "Tên người nhận không quá 100 ký tự")
        private String recipientName;

        @Pattern(regexp = "^(0|\\+84)[0-9]{9}$", message = "Số điện thoại không hợp lệ")
        private String phoneNumber;

        private String province;
        private String district;
        private String ward;
        private Boolean isDefault;
    }
}