package org.cortex.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class MenteeMetadataDto {

    private String id;
    private String name;
    private String keywords;
    private String email;
}
