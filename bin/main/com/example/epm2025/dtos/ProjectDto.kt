package com.example.epm2025.dtos

import java.util.UUID

class ProjectDto(
    val id: UUID?,
    val name: String,
    val posters: List<PosterDto>
)