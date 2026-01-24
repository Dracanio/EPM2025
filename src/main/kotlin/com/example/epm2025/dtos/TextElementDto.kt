package com.example.epm2025.dtos

import java.util.UUID

class TextElementDto(
    id: UUID?,
    x: Float,
    y: Float,
    width: Float,
    height: Float,
    rotation: Float,
    val text: String,
    val font: String,
    val fontSize: Int,
    val color: String,
    val alignment: String
) : ElementDto(
    id, x, y, width, height, rotation, type = "TEXT"
)