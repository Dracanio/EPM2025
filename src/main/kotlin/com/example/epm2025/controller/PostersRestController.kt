package com.example.epm2025.controller

import com.example.epm2025.dtos.PosterDto
import com.example.epm2025.dtos.UpdatePosterDto
import com.example.epm2025.services.PostersService
import com.example.epm2025.models.Poster
import com.example.epm2025.models.Role
import com.example.epm2025.models.UserPrincipal
import com.example.epm2025.services.UsersService
import jakarta.validation.Valid
import org.springframework.http.HttpStatus
import org.springframework.http.MediaType
import org.springframework.security.core.annotation.AuthenticationPrincipal
import org.springframework.web.bind.annotation.*
import org.springframework.web.server.ResponseStatusException
import java.util.*

@RestController
@RequestMapping("/api/v1", produces = [MediaType.APPLICATION_JSON_VALUE, MediaType.APPLICATION_XML_VALUE])
class PosterController(private val postersService: PostersService, private val usersService: UsersService) {

    @PostMapping("/posters")
    fun savePoster(@Valid @RequestBody posterDto: PosterDto, @AuthenticationPrincipal principal: UserPrincipal) : Poster {
        val currentUser = usersService.findByEmail(principal.username)
        val poster = Poster()
        poster.height = posterDto.height
        poster.width = posterDto.width
        poster.name = posterDto.name
        poster.owner = currentUser
        return postersService.savePoster(poster)
    }

    @PutMapping("/posters/{id}")
    fun updatePoster(@PathVariable id: UUID, @Valid @RequestBody dto: UpdatePosterDto, @AuthenticationPrincipal principal: UserPrincipal): Poster {
        val poster = postersService.getPosterById(id)
            ?: throw ResponseStatusException(HttpStatus.NOT_FOUND)
        val currentUser = usersService.findByEmail(principal.username)
        if (poster.owner?.id != currentUser.id && currentUser.role != Role.ADMIN) {
            throw ResponseStatusException(HttpStatus.FORBIDDEN)
        }
        poster.name = dto.name
        poster.width = dto.width
        poster.height = dto.height

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
    fun deletePoster(@PathVariable id: UUID, @AuthenticationPrincipal principal: UserPrincipal) {
        val poster = postersService.getPosterById(id) ?: throw ResponseStatusException(HttpStatus.NOT_FOUND)
        val user = usersService.findByEmail(principal.username)
        if (poster.owner?.id != user.id && user.role != Role.ADMIN) {
            throw ResponseStatusException(HttpStatus.FORBIDDEN)
        }
        postersService.deletePoster(poster)
    }
    @GetMapping("/posters/my")
    fun getMyPosters(@AuthenticationPrincipal principal: UserPrincipal): List<Poster> {
        val user = usersService.findByEmail(principal.username)
        return postersService.getByOwner(user)
    }

}