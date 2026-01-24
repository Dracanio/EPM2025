package com.example.epm2025.dtos

import java.util.UUID

sealed class ElementDto(
    val id: UUID?,
    val x: Float,
    val y: Float,
    val width: Float,
    val height: Float,
    val rotation: Float,
    val type: String
)