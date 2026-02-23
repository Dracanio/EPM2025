package com.example.epm2025.controller

import com.example.epm2025.dtos.PosterDto
import com.example.epm2025.mapper.ElementMapper
import com.example.epm2025.services.PostersService
import com.example.epm2025.models.Poster
import com.example.epm2025.models.Role
import com.example.epm2025.models.UserPrincipal
import com.example.epm2025.services.PosterCollaborationService
import com.example.epm2025.services.UsersService
import jakarta.validation.Valid
import org.springframework.http.HttpStatus
import org.springframework.http.MediaType
import org.springframework.http.ResponseEntity
import org.springframework.security.core.annotation.AuthenticationPrincipal
import org.springframework.web.bind.annotation.*
import org.springframework.web.server.ResponseStatusException
import java.time.LocalDateTime
import java.util.*

@RestController
@RequestMapping("/api/v1", produces = [MediaType.APPLICATION_JSON_VALUE, MediaType.APPLICATION_XML_VALUE])
@CrossOrigin
class PosterController(private val postersService: PostersService, private val usersService: UsersService, private val elementMapper: ElementMapper, private val collaborationService: PosterCollaborationService) {

    @PostMapping("/posters")
    fun savePoster(@Valid @RequestBody posterDto: PosterDto, @AuthenticationPrincipal principal: UserPrincipal) : Poster {
        val currentUser = usersService.findByEmail(principal.username)
        val poster = Poster()
        poster.height = posterDto.height ?: 0f
        poster.width = posterDto.width ?: 0f
        poster.name = posterDto.name
        poster.contentJson = posterDto.contentJson ?: "{}"
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
        
        val permissions = collaborationService.getPermissions(id, currentUser)
        val isOwner = poster.owner?.id == currentUser.id || currentUser.role == Role.ADMIN
        val canEdit = isOwner || permissions["canAddElements"] == true

        if (!canEdit) {
            throw ResponseStatusException(HttpStatus.FORBIDDEN)
        }

        if (!isOwner && poster.name != dto.name) {
        }
        
        if (isOwner) {
            poster.name = dto.name
        }
        
        poster.width = dto.width ?: poster.width
        poster.height = dto.height ?: poster.height
        poster.contentJson = dto.contentJson ?: poster.contentJson
        poster.status = dto.status
        poster.updatedAt = LocalDateTime.now()

        if (dto.elements.isNotEmpty()) {
            val existingElements = poster.elements.associateBy { it.id }.toMutableMap()
            val newElements = dto.elements.map { elementDto -> elementMapper.toElement(elementDto, poster) }
            val newIds = newElements.map { it.id }.toSet()
            val toRemove = poster.elements.filter { it.id !in newIds }
            toRemove.forEach { poster.removeElement(it) }
            newElements.forEach { newElement -> 
                val existing = existingElements[newElement.id]
                if (existing == null) { poster.addElement(newElement) }
                else { elementMapper.updateElement(existing, newElement) } 
            }
        }
        
        return postersService.savePoster(poster)
    }

    @GetMapping("/posters/{id}")
    fun getById(@PathVariable id: UUID, @AuthenticationPrincipal principal: UserPrincipal): ResponseEntity<Map<String, Any?>> {
        val poster = postersService.getPosterById(id)
            ?: throw ResponseStatusException(HttpStatus.NOT_FOUND)
        val currentUser = usersService.findByEmail(principal.username)
        val permissions = collaborationService.getPermissions(id, currentUser)
        if (poster.owner?.id != currentUser.id && permissions["canAddElements"] == null && currentUser.role != Role.ADMIN) {
             val colabs = collaborationService.getCollaborationsForPoster(id)
             if (colabs.none { it.user?.id == currentUser.id }) {
                 throw ResponseStatusException(HttpStatus.FORBIDDEN)
             }
        }
        val response = mapOf(
            "id" to poster.id,
            "name" to poster.name,
            "title" to poster.name,
            "contentJson" to poster.contentJson,
            "updatedAt" to poster.updatedAt,
            "owner" to poster.owner,
            "ownerId" to poster.owner?.id,
            "permissions" to permissions
        )
        return ResponseEntity.ok(response)
    }

    @GetMapping("/posters/by-project/{projectId}")
    fun getByProject(@PathVariable projectId: UUID): List<Poster>{
        return postersService.getByProject(projectId)!!
    }

    @GetMapping("/posters/my")
    fun getMyPosters(@AuthenticationPrincipal principal: UserPrincipal): List<Poster> {
        val user = usersService.findByEmail(principal.username)
        val owned = postersService.getByOwner(user)
        val collaborated = postersService.getPostersByCollaborator(user)
        return owned + collaborated
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

    @GetMapping("/posters/{id}/collaborators")
    fun getCollaborators(@PathVariable id: UUID, @AuthenticationPrincipal principal: UserPrincipal): List<Any> {
        val poster = postersService.getPosterById(id) ?: throw ResponseStatusException(HttpStatus.NOT_FOUND)
        val user = usersService.findByEmail(principal.username)
        
        if (poster.owner?.id != user.id && user.role != Role.ADMIN) {
            throw ResponseStatusException(HttpStatus.FORBIDDEN)
        }

        return collaborationService.getCollaborationsForPoster(id).map {
            mapOf(
                "id" to it.user?.id,
                "username" to it.user?.email,
                "canAddElements" to it.canAddElements,
                "canDeleteElements" to it.canDeleteElements,
                "canAddLinkImages" to it.canAddLinkImages,
                "canExport" to it.canExport,
                "canUseColorPicker" to it.canUseColorPicker,
                "canChangeCanvasSize" to it.canChangeCanvasSize
            )
        }
    }

    @PostMapping("/posters/{id}/collaborators")
    fun addCollaborator(@PathVariable id: UUID, @RequestBody request: Map<String, String>, @AuthenticationPrincipal principal: UserPrincipal): Map<String, String> {
        val poster = postersService.getPosterById(id) ?: throw ResponseStatusException(HttpStatus.NOT_FOUND)
        val user = usersService.findByEmail(principal.username)
        if (poster.owner?.id != user.id && user.role != Role.ADMIN) {
            throw ResponseStatusException(HttpStatus.FORBIDDEN)
        }
        val username = request["username"] ?: throw ResponseStatusException(HttpStatus.BAD_REQUEST, "Username required")
        collaborationService.addCollaborator(id, username)

        return mapOf("message" to "Collaborator added")
    }

    @DeleteMapping("/posters/{id}/collaborators/{userId}")
    fun removeCollaborator(@PathVariable id: UUID, @PathVariable userId: UUID, @AuthenticationPrincipal principal: UserPrincipal) {
        val poster = postersService.getPosterById(id) ?: throw ResponseStatusException(HttpStatus.NOT_FOUND)
        val user = usersService.findByEmail(principal.username)
        if (poster.owner?.id != user.id && user.role != Role.ADMIN) {
            throw ResponseStatusException(HttpStatus.FORBIDDEN)
        }
        collaborationService.removeCollaborator(id, userId)
    }

    @PutMapping("/posters/{id}/collaborators/{userId}/permissions")
    fun updatePermissions(@PathVariable id: UUID, @PathVariable userId: UUID, @RequestBody permissions: Map<String, Boolean>, @AuthenticationPrincipal principal: UserPrincipal) {
        val poster = postersService.getPosterById(id) ?: throw ResponseStatusException(HttpStatus.NOT_FOUND)
        val user = usersService.findByEmail(principal.username)
        if (poster.owner?.id != user.id && user.role != Role.ADMIN) {
            throw ResponseStatusException(HttpStatus.FORBIDDEN)
        }
        collaborationService.updatePermissions(id, userId, permissions)
    }
}