package com.example.epm2025.controller

import com.example.epm2025.dtos.PosterDto
import com.example.epm2025.services.PostersService
import com.example.epm2025.models.Poster
import jakarta.validation.Valid
import org.springframework.http.MediaType
import org.springframework.web.bind.annotation.*
import java.util.*

@RestController
@RequestMapping("/api/v1", produces = [MediaType.APPLICATION_JSON_VALUE, MediaType.APPLICATION_XML_VALUE])
class PosterController(private val postersService: PostersService) {

    @PostMapping("/posters")
    fun savePoster(@Valid @RequestBody posterDto: PosterDto) : Poster {
        val poster = Poster()
        poster.height = posterDto.height
        poster.width = posterDto.width
        poster.name = posterDto.name
        return postersService.savePoster(poster)
    }

    @GetMapping("/posters/{id}")
    fun getById(@PathVariable id: UUID): Poster {
        return postersService.getPosterById(id)!!
    }
    @GetMapping("/posters/by-project/{projectId}")
    fun getByProject(@PathVariable projectId: UUID): List<Poster>{
        return postersService.getByProject(projectId)!!
    }

    @DeleteMapping("/posters/{id}")
    fun deletePoster(@PathVariable id: UUID) {
        val poster = postersService.getPosterById(id)
        postersService.deletePoster(poster!!)
    }

}