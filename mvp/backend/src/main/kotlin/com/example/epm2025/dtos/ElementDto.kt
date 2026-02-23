package com.example.epm2025.dtos

import com.fasterxml.jackson.annotation.JsonSubTypes
import com.fasterxml.jackson.annotation.JsonTypeInfo
import java.util.UUID

@JsonTypeInfo(
    use = JsonTypeInfo.Id.NAME,
    include = JsonTypeInfo.As.PROPERTY,
    property = "type"
)
@JsonSubTypes(
    JsonSubTypes.Type(value = TextElementDto::class, name = "TEXT"),
    JsonSubTypes.Type(value = ImageElementDto::class, name = "IMAGE")
)
open class ElementDto(
    open val id: UUID?,
    open val x: Float,
    open val y: Float,
    open val width: Float,
    open val height: Float,
    open val rotation: Float,
    open val type: String
)