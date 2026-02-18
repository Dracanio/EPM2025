package com.example.epm2025.mapper

import com.example.epm2025.dtos.*
import com.example.epm2025.models.*
import com.example.epm2025.repositories.AssetRepository
import org.springframework.stereotype.Component
import java.util.*

@Component
class ElementMapper(
    private val assetRepository: AssetRepository
) {

    fun toEntity(dto: ElementDto, poster: Poster): Element {
        return when (dto) {

            is TextElementDto -> TextElement().apply {
                id = dto.id ?: UUID.randomUUID()
                x = dto.x
                y = dto.y
                width = dto.width
                height = dto.height
                rotation = dto.rotation
                text = dto.text
                font = dto.font
                fontSize = dto.fontSize
                color = dto.color
                alignment = dto.alignment
                this.poster = poster
            }

            is ImageElementDto -> ImageElement().apply {
                id = dto.id ?: UUID.randomUUID()
                x = dto.x
                y = dto.y
                width = dto.width
                height = dto.height
                rotation = dto.rotation
                asset = assetRepository.getReferenceById(dto.assetId)
                this.poster = poster
            }

            else -> throw IllegalArgumentException("Unknown element type")
        }
    }

    fun toDto(entity: Element): ElementDto {
        return when (entity) {

            is TextElement -> TextElementDto(
                id = entity.id,
                x = entity.x,
                y = entity.y,
                width = entity.width,
                height = entity.height,
                rotation = entity.rotation,
                text = entity.text,
                font = entity.font,
                fontSize = entity.fontSize,
                color = entity.color,
                alignment = entity.alignment
            )

            is ImageElement -> ImageElementDto(
                id = entity.id,
                x = entity.x,
                y = entity.y,
                width = entity.width,
                height = entity.height,
                rotation = entity.rotation,
                assetId = entity.asset.id
            )

            else -> throw IllegalArgumentException("Unknown element type")
        }
    }
}