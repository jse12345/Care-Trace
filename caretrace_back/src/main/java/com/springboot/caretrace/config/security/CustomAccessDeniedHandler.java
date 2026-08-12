package com.springboot.caretrace.config.security;

import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.extern.log4j.Log4j2;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.web.access.AccessDeniedHandler;
import org.springframework.stereotype.Component;

import java.io.IOException;
import java.util.LinkedHashMap;
import java.util.Map;

@Component
@Log4j2
public class CustomAccessDeniedHandler implements AccessDeniedHandler {
    @Override
    public void handle(HttpServletRequest request, HttpServletResponse response,
                       AccessDeniedException accessDeniedException) throws IOException {
        log.warn(
                "[handle] 접근 권한 거부. path: {}, message: {}",
                request.getRequestURI(),
                accessDeniedException.getMessage()
        );

        Map<String, String> errorResponse = new LinkedHashMap<>();
        errorResponse.put("error type", HttpStatus.FORBIDDEN.getReasonPhrase());
        errorResponse.put("code", String.valueOf(HttpStatus.FORBIDDEN.value()));
        errorResponse.put("message", "접근 권한이 없습니다.");

        response.setStatus(HttpStatus.FORBIDDEN.value());
        response.setContentType("application/json");
        response.setCharacterEncoding("utf-8");
        response.getWriter().write(
                new ObjectMapper().writeValueAsString(errorResponse)
        );
    }
}
