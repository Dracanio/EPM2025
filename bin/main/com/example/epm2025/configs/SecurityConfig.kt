package com.example.epm2025.configs

import com.example.epm2025.services.CustomUserDetailsService
import com.example.epm2025.services.UserPrincipalService
import org.springframework.context.annotation.Bean
import org.springframework.context.annotation.Configuration
import org.springframework.http.HttpMethod
import org.springframework.security.authentication.AuthenticationProvider
import org.springframework.security.authentication.dao.DaoAuthenticationProvider
import org.springframework.security.config.annotation.web.builders.HttpSecurity
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder
import org.springframework.security.crypto.password.PasswordEncoder
import org.springframework.security.web.SecurityFilterChain


@Configuration
@EnableWebSecurity
class SecurityConfig(private val userPrincipalService: UserPrincipalService) {

    @Bean
    fun filterChain(http: HttpSecurity, authenticationProvider: AuthenticationProvider): SecurityFilterChain {
        http
            .authenticationProvider(authenticationProvider)
            .csrf {   it.disable()  }
            .headers { it.frameOptions { it.disable() } }
            .authorizeHttpRequests {
                it.requestMatchers(
                    "/h2-console/**",
                    "/",
                    "/api/v1/login",
                    "/api/v1/register",
                    "/assets/**",
                    "/index.html",
                    "/login",
                    "/vite.svg",
                    "/api/v1/users"
                ).permitAll()
                it.requestMatchers(HttpMethod.POST, "/api/v1/users").permitAll()
                it.requestMatchers("/api/**").authenticated()
                it.anyRequest().authenticated()
            }
            .formLogin {it.disable()}
            .httpBasic{}

        return http.build()
    }

    @Bean
    fun passwordEncoder(): PasswordEncoder =
        BCryptPasswordEncoder(10)

//    @Bean
//    fun userDetailsService(passwordEncoder: PasswordEncoder): UserDetailsService {
//        val user = User.builder()
//            .username("admin")
//            .password(passwordEncoder.encode("admin123"))
//            .roles("ADMIN")
//            .build()
//
//        return InMemoryUserDetailsManager(user)
//    }

    @Bean
    fun authenticationProvider(
        userDetailsService: CustomUserDetailsService,
        passwordEncoder: PasswordEncoder
    ): AuthenticationProvider {

        val provider = DaoAuthenticationProvider(userDetailsService)
        provider.setPasswordEncoder(passwordEncoder)
        return provider
    }
}

