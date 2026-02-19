package com.example.epm2025.dtos

import com.example.epm2025.models.PosterStatus
import java.util.UUID

class PosterDto(
    val id: UUID?,
    val name: String,
    val height: Float,
    val width: Float,
    val status: PosterStatus = PosterStatus.DRAFT,
    val elements: List<ElementDto> = emptyList()
)

