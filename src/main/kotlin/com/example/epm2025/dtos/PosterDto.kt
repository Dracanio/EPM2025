package com.example.epm2025.dtos

import java.util.UUID

class PosterDto(
    val id: UUID?,
    val name: String,
    val height: Float,
    val width: Float,
    val elements: List<ElementDto>
)

data class UpdatePosterDto(
    val name: String,
    val width: Float,
    val height: Float
)