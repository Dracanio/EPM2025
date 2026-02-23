package com.example.epm2025.controller

import com.example.epm2025.dtos.ElementDto
import com.example.epm2025.mapper.ElementMapper
import com.example.epm2025.services.ElementsService
import com.example.epm2025.models.Element
import com.example.epm2025.services.PostersService
import org.springframework.http.HttpStatus
import org.springframework.http.MediaType
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.*
import org.springframework.web.server.ResponseStatusException
import java.util.UUID

@RestController
@RequestMapping("/api/v1/posters/{posterId}", produces = [MediaType.APPLICATION_JSON_VALUE, MediaType.APPLICATION_XML_VALUE])
class ElementController(private val elementsService: ElementsService, private val postersService: PostersService, private val elementMapper: ElementMapper) {

    @GetMapping("/elements")
    fun getElements(@PathVariable posterId: String): List<Element> {
        return elementsService.getAllElements()
    }

    @GetMapping("/elements/{id}")
    fun getById(@PathVariable id: UUID, @PathVariable posterId: String): Element {
       return elementsService.getElementById(id)!!
    }

    @PostMapping("/elements")
    fun addElement(@PathVariable posterId: UUID, @RequestBody dto: ElementDto): ResponseEntity<ElementDto> {

        val poster = postersService.getPosterById(posterId)
            ?: throw ResponseStatusException(HttpStatus.NOT_FOUND)

        val element = elementMapper.toElement(dto, poster)

        poster.addElement(element)
        elementsService.saveElement(element)

        return ResponseEntity.status(HttpStatus.CREATED)
            .body(elementMapper.toDto(element))
    }

    @DeleteMapping("/elements/{elementId}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    fun deleteElement(@PathVariable posterId: UUID, @PathVariable elementId: UUID) {
        val poster = postersService.getPosterById(posterId)
            ?: throw ResponseStatusException(HttpStatus.NOT_FOUND)

        val element = poster.elements.find { it.id == elementId }
            ?: throw ResponseStatusException(HttpStatus.NOT_FOUND)

        poster.removeElement(element)
        elementsService.deleteElement(element)
    }
}