package com.example.poster.controller

import com.example.poster.dto.AuthRequest
import com.example.poster.dto.AuthResponse
import com.example.poster.dto.RegisterRequest
import com.example.poster.model.User
import com.example.poster.repository.UserRepository
import com.example.poster.security.JwtUtil
import org.springframework.http.ResponseEntity
import org.springframework.security.authentication.AuthenticationManager
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken
import org.springframework.security.crypto.password.PasswordEncoder
import org.springframework.web.bind.annotation.PostMapping
import org.springframework.web.bind.annotation.RequestBody
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RestController

@RestController
@RequestMapping("/api/auth")
class AuthController(
    private val authenticationManager: AuthenticationManager,
    private val jwtUtil: JwtUtil,
    private val userRepository: UserRepository,
    private val passwordEncoder: PasswordEncoder
) {

    @PostMapping("/register")
    fun register(@RequestBody request: RegisterRequest): ResponseEntity<Any> {
        if (userRepository.existsByUsername(request.username)) {
            return ResponseEntity.badRequest().body("Username is already taken")
        }

        val user = User(
            username = request.username,
            password = passwordEncoder.encode(request.password)
        )
        userRepository.save(user)

        return ResponseEntity.ok("User registered successfully")
    }

    @PostMapping("/login")
    fun login(@RequestBody request: AuthRequest): ResponseEntity<AuthResponse> {
        authenticationManager.authenticate(
            UsernamePasswordAuthenticationToken(request.username, request.password)
        )
        
        // We load the user from db to get the UserDetails (or we could cast the authentication principal)
        val user = userRepository.findByUsername(request.username).orElseThrow()
        
        // Simulating loading UserDetails for token generation (simplified)
        // In a real app, we should use UserDetailsService or cast the principal
        val userDetails = org.springframework.security.core.userdetails.User.builder()
                .username(user.username)
                .password(user.password)
                .roles("USER")
                .build()

        val token = jwtUtil.generateToken(userDetails)
        return ResponseEntity.ok(AuthResponse(token))
    }
    @org.springframework.web.bind.annotation.GetMapping("/me")
    fun getMe(@org.springframework.security.core.annotation.AuthenticationPrincipal userDetails: org.springframework.security.core.userdetails.UserDetails): ResponseEntity<User> {
         val user = userRepository.findByUsername(userDetails.username).orElseThrow()
         return ResponseEntity.ok(user)
    }
}
