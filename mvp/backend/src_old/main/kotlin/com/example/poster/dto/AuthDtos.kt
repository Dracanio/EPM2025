package com.example.poster.dto

data class AuthRequest(
    val username: String,
    val password: String
)

data class AuthResponse(
    val token: String
)

data class RegisterRequest(
    val username: String,
    val password: String
)
