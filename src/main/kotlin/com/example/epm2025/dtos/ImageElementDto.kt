package com.example.epm2025.dtos

import java.util.UUID

class ImageElementDto(
    id: UUID?,
    x: Float,
    y: Float,
    width: Float,
    height: Float,
    rotation: Float,
    val assetId: UUID
) : ElementDto(
    id, x, y, width, height, rotation, type = "IMAGE"
)