package com.springboot.caretrace.common.exception;

import jakarta.servlet.http.HttpServletRequest;
import lombok.extern.log4j.Log4j2;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.server.ResponseStatusException;

import java.util.HashMap;
import java.util.Map;

@RestControllerAdvice
@Log4j2
public class CustomExceptionHandler {

    // 의료진·진료과 기능에서 발생한 400, 404, 409 오류 처리
    @ExceptionHandler(ResponseStatusException.class)
    public ResponseEntity<Map<String, String>> handleResponseStatusException(
            ResponseStatusException e,
            HttpServletRequest request
    ) {
        log.error(
                "ResponseStatusException 발생, URL: {}, 상태: {}, 메시지: {}",
                request.getRequestURI(),
                e.getStatusCode(),
                e.getReason()
        );

        Map<String, String> map = new HashMap<>();
        map.put("error type", e.getStatusCode().toString());
        map.put("code", String.valueOf(e.getStatusCode().value()));
        map.put(
                "message",
                e.getReason() != null ? e.getReason() : e.getMessage()
        );

        return ResponseEntity
                .status(e.getStatusCode())
                .body(map);
    }

    // 기존 서버 오류 처리
    @ExceptionHandler(value = RuntimeException.class)
    public ResponseEntity<Map<String, String>> handleException(
            RuntimeException e,
            HttpServletRequest request
    ) {
        HttpHeaders responseHeaders = new HttpHeaders();
        HttpStatus httpStatus = HttpStatus.INTERNAL_SERVER_ERROR;

        log.error(
                "Advice 내 handleException 호출, {}, {}",
                request.getRequestURI(),
                e.getMessage()
        );

        Map<String, String> map = new HashMap<>();
        map.put("error type", httpStatus.getReasonPhrase());
        map.put("code", String.valueOf(httpStatus.value()));
        map.put("message", e.getMessage());

        return new ResponseEntity<>(
                map,
                responseHeaders,
                httpStatus
        );
    }
}