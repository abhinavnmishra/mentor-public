package org.cortex.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class TrainerUpdateDTO {
    private String firstName;
    private String lastName;
    private String email;
    private String shortDescription;
    private String longDescription;
    private String profileImageUrl;
    private String signature;
    private String signatureImageId;
    private String location;
    private String linkedinUrl;
    private String timeZone;
} 