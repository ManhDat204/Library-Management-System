package com.dat.LibraryManagementSystem.service;

import com.cloudinary.Cloudinary;
import com.cloudinary.utils.ObjectUtils;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.Map;

@Service
@RequiredArgsConstructor
@Slf4j
public class CloudinaryService {

    private final Cloudinary cloudinary;

    
    public String uploadImage(MultipartFile file, String folder) throws IOException {
        Map uploadResult = cloudinary.uploader().upload(
                file.getBytes(),
                ObjectUtils.asMap(
                        "folder", folder,
                        "resource_type", "image"
                )
        );
        log.info("Image uploaded to folder: {}", folder);
        return (String) uploadResult.get("secure_url");
    }


    public String uploadImage(MultipartFile file) throws IOException {
        return uploadImage(file, "library/covers");
    }


    public String uploadUserAvatar(MultipartFile file) throws IOException {
        return uploadImage(file, "user-avatars");
    }
}