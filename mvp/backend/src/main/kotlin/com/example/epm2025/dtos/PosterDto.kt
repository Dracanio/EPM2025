package com.example.epm2025.dtos

import com.example.epm2025.models.PosterStatus
import java.util.UUID

data class PosterDto(
    val id: UUID? = null,
    val name: String,
    val height: Float? = 0f,
    val width: Float? = 0f,
    val status: PosterStatus = PosterStatus.DRAFT,
    val contentJson: String? = "{}",
    val elements: List<ElementDto> = emptyList()
)
