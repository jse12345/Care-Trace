package com.springboot.caretrace.api.data.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SignInResultDto {

    private boolean success;
    private int code;
    private String msg;
    private String token;
}
