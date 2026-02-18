package com.example.epm2025.dtos

import java.util.UUID

class TextElementDto(
    override val id: UUID?,
    override val x: Float,
    override val y: Float,
    override val width: Float,
    override val height: Float,
    override val rotation: Float,
    val text: String,
    val font: String,
    val fontSize: Int,
    val color: String,
    val alignment: String
) : ElementDto(
    id, x, y, width, height, rotation, type = "TEXT"
)