package com.example.epm2025.controller

import com.example.epm2025.dtos.PosterDto
import com.example.epm2025.mapper.ElementMapper
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
import java.time.LocalDateTime
import java.util.*

@RestController
@RequestMapping("/api/v1", produces = [MediaType.APPLICATION_JSON_VALUE, MediaType.APPLICATION_XML_VALUE])
class PosterController(private val postersService: PostersService, private val usersService: UsersService, private val elementMapper: ElementMapper) {

    @PostMapping("/posters")
    fun savePoster(@Valid @RequestBody posterDto: PosterDto, @AuthenticationPrincipal principal: UserPrincipal) : Poster {
        val currentUser = usersService.findByEmail(principal.username)
        val poster = Poster()
        poster.height = posterDto.height
        poster.width = posterDto.width
        poster.name = posterDto.name
        poster.owner = currentUser
        posterDto.elements.forEach { elementDto ->
            val element = elementMapper.toElement(elementDto, poster)
            poster.addElement(element)
        }
        return postersService.savePoster(poster)
    }
    @PutMapping("/posters/{id}")
    fun updatePoster(@PathVariable id: UUID, @Valid @RequestBody dto: PosterDto, @AuthenticationPrincipal principal: UserPrincipal): Poster {
        val poster = postersService.getPosterById(id)
            ?: throw ResponseStatusException(HttpStatus.NOT_FOUND)
        val currentUser = usersService.findByEmail(principal.username)
        if (poster.owner?.id != currentUser.id && currentUser.role != Role.ADMIN) {
            throw ResponseStatusException(HttpStatus.FORBIDDEN)
        }
        poster.name = dto.name
        poster.width = dto.width
        poster.height = dto.height
        poster.status = dto.status
        poster.updatedAt = LocalDateTime.now()

        val existingElements = poster.elements.associateBy { it.id }.toMutableMap()
        val newElements = dto.elements.map { elementDto -> elementMapper.toElement(elementDto, poster) }
        val newIds = newElements.map { it.id }.toSet()
        val toRemove = poster.elements.filter { it.id !in newIds }
        toRemove.forEach { poster.removeElement(it) }
        newElements.forEach { newElement -> val existing = existingElements[newElement.id]
            if (existing == null) { poster.addElement(newElement) }
            else { elementMapper.updateElement(existing, newElement) } }
        return postersService.savePoster(poster)
    }
    @GetMapping("/posters/{id}")
    fun getById(@PathVariable id: UUID): Poster {
        val poster = postersService.getPosterById(id)
            ?: throw ResponseStatusException(HttpStatus.NOT_FOUND)
        return poster
    }
    @GetMapping("/posters/by-project/{projectId}")
    fun getByProject(@PathVariable projectId: UUID): List<Poster>{
        return postersService.getByProject(projectId)!!
    }
    @GetMapping("/posters/my")
    fun getMyPosters(@AuthenticationPrincipal principal: UserPrincipal): List<Poster> {
        val user = usersService.findByEmail(principal.username)
        return postersService.getByOwner(user)
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
    @PostMapping("/projects/{id}/invite")
    fun inviteUser(@PathVariable id: UUID, @RequestParam email: String, @AuthenticationPrincipal principal: UserPrincipal) {
        val poster = postersService.getPosterById(id) ?: throw ResponseStatusException(HttpStatus.NOT_FOUND)

        val currentUser = usersService.findByEmail(principal.username)

        if (poster.owner?.id != currentUser.id) {
            throw ResponseStatusException(HttpStatus.FORBIDDEN)
        }

        val invitedUser = usersService.findByEmail(email)
        poster.collaborators.add(invitedUser)

        postersService.savePoster(poster)
    }

}