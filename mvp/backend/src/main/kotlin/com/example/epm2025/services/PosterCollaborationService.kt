package com.example.epm2025.services

import com.example.epm2025.models.Poster
import com.example.epm2025.models.PosterCollaboration
import com.example.epm2025.models.User
import com.example.epm2025.repositories.PosterCollaborationRepository
import com.example.epm2025.repositories.PostersRepository
import com.example.epm2025.repositories.UsersRepository
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional
import java.util.*

@Service
class PosterCollaborationService(
    private val collaborationRepository: PosterCollaborationRepository,
    private val postersRepository: PostersRepository,
    private val usersRepository: UsersRepository
) {

    fun getCollaborationsForPoster(posterId: UUID): List<PosterCollaboration> {
        return collaborationRepository.findByPosterId(posterId)
    }

    @Transactional
    fun addCollaborator(posterId: UUID, username: String): PosterCollaboration {
        val poster = postersRepository.findById(posterId).orElseThrow { RuntimeException("Poster not found") }
        val user = usersRepository.findByEmail(username) ?: throw RuntimeException("User not found")

        if (poster.owner?.id == user.id) {
            throw RuntimeException("Cannot add owner as collaborator")
        }

        val existing = collaborationRepository.findByPosterIdAndUserId(posterId, user.id)
        if (existing != null) {
            return existing
        }

        val collaboration = PosterCollaboration()
        collaboration.poster = poster
        collaboration.user = user
        
        return collaborationRepository.save(collaboration)
    }

    @Transactional
    fun removeCollaborator(posterId: UUID, userId: UUID) {
        val collaboration = collaborationRepository.findByPosterIdAndUserId(posterId, userId)
        if (collaboration != null) {
            collaborationRepository.delete(collaboration)
        }
    }

    @Transactional
    fun updatePermissions(posterId: UUID, userId: UUID, permissions: Map<String, Boolean>): PosterCollaboration {
        val collaboration = collaborationRepository.findByPosterIdAndUserId(posterId, userId)
            ?: throw RuntimeException("Collaboration not found")

        if (permissions.containsKey("canAddElements")) collaboration.canAddElements = permissions["canAddElements"]!!
        if (permissions.containsKey("canDeleteElements")) collaboration.canDeleteElements = permissions["canDeleteElements"]!!
        if (permissions.containsKey("canAddLinkImages")) collaboration.canAddLinkImages = permissions["canAddLinkImages"]!!
        if (permissions.containsKey("canExport")) collaboration.canExport = permissions["canExport"]!!
        if (permissions.containsKey("canUseColorPicker")) collaboration.canUseColorPicker = permissions["canUseColorPicker"]!!
        if (permissions.containsKey("canChangeCanvasSize")) collaboration.canChangeCanvasSize = permissions["canChangeCanvasSize"]!!

        return collaborationRepository.save(collaboration)
    }

    fun getPermissions(posterId: UUID, user: User): Map<String, Boolean> {
        val poster = postersRepository.findById(posterId).orElse(null) ?: return emptyMap()
        
        if (poster.owner?.id == user.id) {
            return mapOf(
                "canAddElements" to true,
                "canDeleteElements" to true,
                "canAddLinkImages" to true,
                "canExport" to true,
                "canUseColorPicker" to true,
                "canChangeCanvasSize" to true,
                "isOwner" to true
            )
        }

        val collaboration = collaborationRepository.findByPosterIdAndUserId(posterId, user.id)
        if (collaboration != null) {
            return mapOf(
                "canAddElements" to collaboration.canAddElements,
                "canDeleteElements" to collaboration.canDeleteElements,
                "canAddLinkImages" to collaboration.canAddLinkImages,
                "canExport" to collaboration.canExport,
                "canUseColorPicker" to collaboration.canUseColorPicker,
                "canChangeCanvasSize" to collaboration.canChangeCanvasSize,
                "isOwner" to false
            )
        }

        return mapOf(
            "canAddElements" to false,
            "canDeleteElements" to false,
            "canAddLinkImages" to false,
            "canExport" to false,
            "canUseColorPicker" to false,
            "canChangeCanvasSize" to false,
            "isOwner" to false
        )
    }
}
