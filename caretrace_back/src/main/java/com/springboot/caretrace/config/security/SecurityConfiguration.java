package com.springboot.caretrace.config.security;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.List;

@Configuration
public class SecurityConfiguration {

    private final JwtTokenProvider jwtTokenProvider;

    public SecurityConfiguration(
            JwtTokenProvider jwtTokenProvider
    ) {
        this.jwtTokenProvider = jwtTokenProvider;
    }

    @Bean
    public SecurityFilterChain filterChain(
            HttpSecurity httpSecurity
    ) throws Exception {

        httpSecurity
                // JWT 방식이므로 CSRF 비활성화
                .csrf(AbstractHttpConfigurer::disable)

                // React 프론트엔드와 통신하기 위한 CORS 설정
                .cors(cors ->
                        cors.configurationSource(
                                corsConfigurationSource()
                        )
                )

                // 세션을 사용하지 않는 JWT 인증 방식
                .sessionManagement(session ->
                        session.sessionCreationPolicy(
                                SessionCreationPolicy.STATELESS
                        )
                )

                // HTTP Basic 인증 비활성화
                .httpBasic(AbstractHttpConfigurer::disable)

                // URL별 접근 권한 설정
                .authorizeHttpRequests(authorize ->
                        authorize
                                // 사전 요청 허용
                                .requestMatchers(
                                        HttpMethod.OPTIONS,
                                        "/**"
                                )
                                .permitAll()

                                // Swagger 문서 접근 허용
                                .requestMatchers(
                                        "/swagger",
                                        "/swagger-ui.html",
                                        "/swagger-ui/**",
                                        "/api-docs",
                                        "/api-docs/**",
                                        "/v3/api-docs/**"
                                )
                                .permitAll()

                                // 공통 오류 응답 허용
                                .requestMatchers("/error")
                                .permitAll()

                                // 의료진 로그인은 인증 없이 접근
                                .requestMatchers(
                                        HttpMethod.POST,
                                        "/medical-staff/login.do"
                                )
                                .permitAll()

                                /*
                                 * 의료진 목록 및 상세 조회
                                 *
                                 * 담당의사 선택 등에 사용되므로
                                 * 로그인한 의료진도 조회 가능
                                 */
                                .requestMatchers(
                                        HttpMethod.GET,
                                        "/medical-staff/list.do",
                                        "/medical-staff/view.do"
                                )
                                .hasAnyRole(
                                        "ADMIN",
                                        "MEDICAL_STAFF",
                                        "VIEWER"
                                )

                                /*
                                 * 의료진 및 진료과 관리
                                 * 등록·수정·삭제는 관리자만 가능
                                 */
                                .requestMatchers(
                                        "/medical-staff/**",
                                        "/department/**"
                                )
                                .hasRole("ADMIN")

                                /*
                                 * 다른 팀 기능의 조회 요청
                                 *
                                 * 관리자:
                                 * 모든 의료정보 조회 가능
                                 *
                                 * 일반 의료진:
                                 * 환자·영상·병변·협진 정보 조회 가능
                                 *
                                 * 조회자:
                                 * 조회 기능만 가능
                                 */
                                .requestMatchers(
                                        HttpMethod.GET,
                                        "/**"
                                )
                                .hasAnyRole(
                                        "ADMIN",
                                        "MEDICAL_STAFF",
                                        "VIEWER"
                                )

                                /*
                                 * 다른 팀 기능의 등록 요청
                                 *
                                 * 관리자와 일반 의료진만 가능
                                 * 조회자는 등록할 수 없음
                                 */
                                .requestMatchers(
                                        HttpMethod.POST,
                                        "/**"
                                )
                                .hasAnyRole(
                                        "ADMIN",
                                        "MEDICAL_STAFF"
                                )

                                /*
                                 * 다른 팀 기능의 전체 수정 요청
                                 */
                                .requestMatchers(
                                        HttpMethod.PUT,
                                        "/**"
                                )
                                .hasAnyRole(
                                        "ADMIN",
                                        "MEDICAL_STAFF"
                                )

                                /*
                                 * 다른 팀 기능의 일부 수정 요청
                                 */
                                .requestMatchers(
                                        HttpMethod.PATCH,
                                        "/**"
                                )
                                .hasAnyRole(
                                        "ADMIN",
                                        "MEDICAL_STAFF"
                                )

                                /*
                                 * 다른 팀 기능의 삭제 요청
                                 */
                                .requestMatchers(
                                        HttpMethod.DELETE,
                                        "/**"
                                )
                                .hasAnyRole(
                                        "ADMIN",
                                        "MEDICAL_STAFF"
                                )

                                // 위에서 분류되지 않은 요청도 로그인 필요
                                .anyRequest()
                                .authenticated()
                )

                // 기본 로그인 폼 비활성화
                .formLogin(AbstractHttpConfigurer::disable)

                // JWT 인증 필터 등록
                .addFilterBefore(
                        new JwtAuthenticationFilter(
                                jwtTokenProvider
                        ),
                        UsernamePasswordAuthenticationFilter.class
                )

                // 인증·권한 오류 처리
                .exceptionHandling(exceptionHandling ->
                        exceptionHandling
                                .authenticationEntryPoint(
                                        new CustomAuthenticationEntryPoint()
                                )
                                .accessDeniedHandler(
                                        new CustomAccessDeniedHandler()
                                )
                );

        return httpSecurity.build();
    }

    @Bean
    public CorsConfigurationSource
    corsConfigurationSource() {

        CorsConfiguration configuration =
                new CorsConfiguration();

        configuration.setAllowedOriginPatterns(
                List.of(
                        "http://localhost:5173",
                        "http://127.0.0.1:5173",
                        "http://192.168.*.*:5173",
                        "http://10.*.*.*:5173",
                        "http://172.16.*.*:5173"
                )
        );

        configuration.setAllowedMethods(
                List.of(
                        "GET",
                        "POST",
                        "PUT",
                        "PATCH",
                        "DELETE",
                        "OPTIONS"
                )
        );

        configuration.setAllowedHeaders(
                List.of("*")
        );

        configuration.setAllowCredentials(true);

        UrlBasedCorsConfigurationSource source =
                new UrlBasedCorsConfigurationSource();

        source.registerCorsConfiguration(
                "/**",
                configuration
        );

        return source;
    }
}