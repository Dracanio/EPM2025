package com.example.epm2025.dtos

import com.example.epm2025.models.Role
import java.util.UUID

data class LoginRequest(
    val email: String,
    val password: String
)

data class LoginResponse(
    val id: UUID,
    val email: String,
    val firstName: String,
    val lastName: String,
    val role: Role?
)

data class RegisterRequest(
    val email: String,
    val firstName: String,
    val lastName: String,
    val password: String
)