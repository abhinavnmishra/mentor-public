package org.cortex.backend.llm.Completions.pojo;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class TextCompletionDto {

    private String keyword;
    private String id;
    private String currentText;

}
