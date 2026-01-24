package com.example.epm2025.dtos

import java.util.UUID

class PosterDto(
    val id: UUID?,
    val name: String,
    val height: Int,
    val width: Int,
    val elements: List<ElementDto>
)