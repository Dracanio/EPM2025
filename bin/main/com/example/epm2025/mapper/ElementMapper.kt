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

    fun toElement(dto: ElementDto, poster: Poster): Element {
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

    fun toDto(element: Element): ElementDto {
        return when (element) {

            is TextElement -> TextElementDto(
                id = element.id,
                x = element.x,
                y = element.y,
                width = element.width,
                height = element.height,
                rotation = element.rotation,
                text = element.text,
                font = element.font,
                fontSize = element.fontSize,
                color = element.color,
                alignment = element.alignment
            )

            is ImageElement -> ImageElementDto(
                id = element.id,
                x = element.x,
                y = element.y,
                width = element.width,
                height = element.height,
                rotation = element.rotation,
                assetId = element.asset.id
            )

            else -> throw IllegalArgumentException("Unknown element type")
        }
    }
    fun updateElement(target: Element, source: Element) {
        target.x = source.x
        target.y = source.y
        target.width = source.width
        target.height = source.height
        target.rotation = source.rotation

        when {
            target is TextElement && source is TextElement -> {
                target.text = source.text
                target.font = source.font
                target.fontSize = source.fontSize
                target.color = source.color
                target.alignment = source.alignment
            }
            target is ImageElement && source is ImageElement -> {
                target.asset = source.asset
            }
        }
    }
}