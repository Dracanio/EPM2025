package com.example.epm2025.controller

import com.example.epm2025.dtos.ElementDto
import com.example.epm2025.services.ElementsService
import com.example.epm2025.models.Element
import jakarta.validation.Valid
import org.springframework.http.MediaType
import org.springframework.web.bind.annotation.*
import java.util.UUID

@RestController
@RequestMapping("/api/v1", produces = [MediaType.APPLICATION_JSON_VALUE, MediaType.APPLICATION_XML_VALUE])
class ElementController(private val elementsService: ElementsService) {

    @GetMapping("/elements")
    fun getAll(): List<Element> {
        return elementsService.getAllElements()
    }

    @GetMapping("/elements/{id}")
    fun getById(@PathVariable id: UUID): Element {
       return elementsService.getElementById(id)!!
    }

}