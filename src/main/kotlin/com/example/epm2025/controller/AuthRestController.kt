package com.example.epm2025.controller

import com.example.epm2025.dtos.LoginRequest
import com.example.epm2025.dtos.LoginResponse
import com.example.epm2025.dtos.RegisterRequest
import com.example.epm2025.models.Role
import com.example.epm2025.models.User
import com.example.epm2025.models.UserPrincipal
import com.example.epm2025.repositories.UsersRepository
import org.springframework.http.ResponseEntity
import org.springframework.security.authentication.AuthenticationProvider
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken
import org.springframework.security.crypto.password.PasswordEncoder
import org.springframework.web.bind.annotation.PostMapping
import org.springframework.web.bind.annotation.RequestBody
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RestController

@RestController
@RequestMapping("/api/v1")
class AuthController(
    private val authenticationProvider: AuthenticationProvider,
    private val userRepository: UsersRepository,
    private val passwordEncoder: PasswordEncoder
) {

    @PostMapping("/login")
    fun login(@RequestBody request: LoginRequest): ResponseEntity<LoginResponse> {

        val authToken = UsernamePasswordAuthenticationToken(
            request.email,
            request.password
        )

        val auth = authenticationProvider.authenticate(authToken)

        val principal = auth!!.principal as UserPrincipal
        val user = principal.getUser()

        return ResponseEntity.ok(
            LoginResponse(
                id = user.id,
                email = user.email,
                firstName = user.firstName,
                lastName = user.lastName,
                role = user.role
            )
        )
    }

    @PostMapping("/register")
    fun register(@RequestBody request: RegisterRequest): ResponseEntity<LoginResponse> {

        val user = User()
        user.email = request.email
        user.firstName = request.firstName
        user.lastName = request.lastName
        user.passwordHash = request.password
        user.role = Role.STUDENT   // Default-Rolle


        val savedUser = userRepository.save(user)

        return ResponseEntity.ok(
            LoginResponse(
                id = savedUser.id,
                email = savedUser.email,
                firstName = savedUser.firstName,
                lastName = savedUser.lastName,
                role = savedUser.role
            )
        )
    }
}