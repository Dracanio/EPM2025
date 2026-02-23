package com.example.epm2025.dtos

import java.util.UUID

class ImageElementDto(
    override val id: UUID?,
    override val x: Float,
    override val y: Float,
    override val width: Float,
    override val height: Float,
    override val rotation: Float,
    val assetId: UUID
) : ElementDto(
    id, x, y, width, height, rotation, type = "IMAGE"
)