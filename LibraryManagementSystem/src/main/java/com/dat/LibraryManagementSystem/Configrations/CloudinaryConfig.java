package com.dat.LibraryManagementSystem.Configrations;

import com.cloudinary.Cloudinary;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.util.Map;

@Configuration
public class CloudinaryConfig {

    @Bean
    public Cloudinary cloudinary() {
        return new Cloudinary(Map.of(
                "cloud_name", "dses0w8wx",
                "api_key", "764936678846685",
                "api_secret", "zm8F1NeGJLDq6HS4Npu35Zr7EZU"
        ));
    }
}