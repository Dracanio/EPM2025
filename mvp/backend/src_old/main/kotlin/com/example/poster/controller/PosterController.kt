package com.example.poster.controller

import com.example.poster.model.Poster
import com.example.poster.model.PosterCollaboration
import com.example.poster.model.User
import com.example.poster.repository.PosterRepository
import com.example.poster.repository.UserRepository
import org.springframework.http.ResponseEntity
import org.springframework.security.core.annotation.AuthenticationPrincipal
import org.springframework.security.core.userdetails.UserDetails
import org.springframework.web.bind.annotation.*
import org.springframework.http.MediaType
import org.springframework.http.HttpStatus
import java.net.URL

@RestController
@RequestMapping("/api/posters")
class PosterController(
    private val posterRepository: PosterRepository,
    private val userRepository: UserRepository
) {

    @GetMapping
    fun getAllPosters(@AuthenticationPrincipal userDetails: UserDetails): List<Poster> {
        val user = userRepository.findByUsername(userDetails.username).orElseThrow()
        return posterRepository.findByUserId(user.id)
    }

    @PostMapping
    fun createPoster(@AuthenticationPrincipal userDetails: UserDetails, @RequestBody poster: Poster): Poster {
        val user = userRepository.findByUsername(userDetails.username).orElseThrow()
        val newPoster = poster.copy(user = user) // Create a copy with the user set
        return posterRepository.save(newPoster)
    }

    @GetMapping("/{id}")
    fun getPoster(@PathVariable id: Long, @AuthenticationPrincipal userDetails: UserDetails): ResponseEntity<Map<String, Any>> {
        val user = userRepository.findByUsername(userDetails.username).orElseThrow()
        val poster = posterRepository.findById(id).orElse(null) ?: return ResponseEntity.notFound().build()

        val isOwner = poster.user?.id == user.id
        val collaboration = poster.collaborations.find { it.user?.id == user.id }

        if (!isOwner && collaboration == null) {
            return ResponseEntity.status(403).build()
        }

        val permissions = mapOf(
            "canAddElements" to (isOwner || collaboration?.canAddElements == true),
            "canDeleteElements" to (isOwner || collaboration?.canDeleteElements == true),
            "canAddLinkImages" to (isOwner || collaboration?.canAddLinkImages == true),
            "canExport" to (isOwner || collaboration?.canExport == true),
            "canUseColorPicker" to (isOwner || collaboration?.canUseColorPicker == true),
            "canChangeCanvasSize" to (isOwner || collaboration?.canChangeCanvasSize == true),
            "isOwner" to isOwner
        )

        val response = mapOf(
            "id" to poster.id,
            "title" to poster.title,
            "contentJson" to poster.contentJson,
            "updatedAt" to poster.updatedAt,
            "ownerId" to poster.user?.id, // Assuming poster.user is the owner
            "ownerUsername" to poster.user?.username, // Assuming poster.user is the owner
            "permissions" to permissions
        )

        return ResponseEntity.ok(response) as ResponseEntity<Map<String, Any>>
    }

    @PutMapping("/{id}")
    fun updatePoster(@PathVariable id: Long, @RequestBody updatedPoster: Poster, @AuthenticationPrincipal userDetails: UserDetails): ResponseEntity<Poster> {
        val user = userRepository.findByUsername(userDetails.username).orElseThrow()
        val poster = posterRepository.findById(id).orElse(null) ?: return ResponseEntity.notFound().build()

        val isOwner = poster.user?.id == user.id
        val collaboration = poster.collaborations.find { it.user?.id == user.id }

        if (!isOwner && collaboration == null) {
            return ResponseEntity.status(403).build()
        }

        // Collaborators cannot rename project
        if (!isOwner && poster.title != updatedPoster.title) {
             return ResponseEntity.status(403).body(null) // Or maintain original title silently
        }
        
        // Update title only if owner (or valid logic, but requirements say colabs cant rename)
        if (isOwner) {
            poster.title = updatedPoster.title
        }

        poster.contentJson = updatedPoster.contentJson
        poster.updatedAt = java.time.LocalDateTime.now()
        val savedPoster = posterRepository.save(poster)
        return ResponseEntity.ok(savedPoster)
    }

    @DeleteMapping("/{id}")
    fun deletePoster(@AuthenticationPrincipal userDetails: UserDetails, @PathVariable id: Long): ResponseEntity<Void> {
        val user = userRepository.findByUsername(userDetails.username).orElseThrow()
        val poster = posterRepository.findById(id).orElse(null) ?: return ResponseEntity.notFound().build()

        // Only owner can delete
        if (poster.user?.id != user.id) {
            return ResponseEntity.status(403).build()
        }

        posterRepository.delete(poster)
        return ResponseEntity.noContent().build()
    }

    @PostMapping("/{id}/collaborators")
    fun addCollaborator(@PathVariable id: Long, @RequestBody request: Map<String, String>, @AuthenticationPrincipal userDetails: UserDetails): ResponseEntity<Any> {
        val user = userRepository.findByUsername(userDetails.username).orElseThrow()
        val poster = posterRepository.findById(id).orElse(null) ?: return ResponseEntity.notFound().build()

        if (poster.user?.id != user.id) {
            return ResponseEntity.status(403).build()
        }

        val usernameToAdd = request["username"] ?: return ResponseEntity.badRequest().body("Username required")
        if (usernameToAdd == user.username) {
            return ResponseEntity.badRequest().body("Cannot add yourself")
        }

        val userToAdd = userRepository.findByUsername(usernameToAdd).orElse(null)
            ?: return ResponseEntity.badRequest().body("User not found")

        if (poster.collaborations.any { it.user?.id == userToAdd.id }) {
             return ResponseEntity.ok("Already a collaborator")
        }

        val collaboration = PosterCollaboration(poster = poster, user = userToAdd)
        poster.collaborations.add(collaboration)
        posterRepository.save(poster)

        return ResponseEntity.ok("Collaborator added")
    }

    @DeleteMapping("/{id}/collaborators/{userId}")
    fun removeCollaborator(@PathVariable id: Long, @PathVariable userId: Long, @AuthenticationPrincipal userDetails: UserDetails): ResponseEntity<Any> {
        val user = userRepository.findByUsername(userDetails.username).orElseThrow()
        val poster = posterRepository.findById(id).orElse(null) ?: return ResponseEntity.notFound().build()

        if (poster.user?.id != user.id) {
            return ResponseEntity.status(403).build()
        }

        poster.collaborations.removeIf { it.user?.id == userId }
        posterRepository.save(poster)

        return ResponseEntity.ok("Collaborator removed")
    }
    
    @GetMapping("/{id}/collaborators")
    fun getCollaborators(@PathVariable id: Long, @AuthenticationPrincipal userDetails: UserDetails): ResponseEntity<List<Any>> {
        val user = userRepository.findByUsername(userDetails.username).orElseThrow()
        val poster = posterRepository.findById(id).orElse(null) ?: return ResponseEntity.notFound().build()

         // Allow owner or collaborators to see list (or maybe just owner? Request implies owner manages permissions)
        if (poster.user?.id != user.id) {
             // For now, let collaborators see who else is there, but without sensitive info if needed
             // Requirements said "Owner can set rights", strictly, we might restrict this.
             // But existing frontend shows members. Let's keep it visible but maybe read-only.
             // Actually, hiding members from collaborators was part of previous task.
             // If caller is not owner, they shouldn't see this list based on previous task.
             return ResponseEntity.status(403).build()
        }

        val result = poster.collaborations.map {
            mapOf(
                "id" to it.user?.id,
                "username" to it.user?.username,
                "canAddElements" to it.canAddElements,
                "canDeleteElements" to it.canDeleteElements,
                "canAddLinkImages" to it.canAddLinkImages,
                "canAddLinkImages" to it.canAddLinkImages,
                "canExport" to it.canExport,
                "canUseColorPicker" to it.canUseColorPicker,
                "canChangeCanvasSize" to it.canChangeCanvasSize
            )
        }
        return ResponseEntity.ok(result)
    }

    @PutMapping("/{id}/collaborators/{userId}/permissions")
    fun updatePermissions(@PathVariable id: Long, @PathVariable userId: Long, @RequestBody permissions: Map<String, Boolean>, @AuthenticationPrincipal userDetails: UserDetails): ResponseEntity<Any> {
        val user = userRepository.findByUsername(userDetails.username).orElseThrow()
        val poster = posterRepository.findById(id).orElse(null) ?: return ResponseEntity.notFound().build()

        if (poster.user?.id != user.id) {
            return ResponseEntity.status(403).build()
        }

        val collaboration = poster.collaborations.find { it.user?.id == userId } ?: return ResponseEntity.notFound().build()
        
        if (permissions.containsKey("canAddElements")) collaboration.canAddElements = permissions["canAddElements"]!!
        if (permissions.containsKey("canDeleteElements")) collaboration.canDeleteElements = permissions["canDeleteElements"]!!
        if (permissions.containsKey("canAddLinkImages")) collaboration.canAddLinkImages = permissions["canAddLinkImages"]!!
        if (permissions.containsKey("canExport")) collaboration.canExport = permissions["canExport"]!!
        if (permissions.containsKey("canUseColorPicker")) collaboration.canUseColorPicker = permissions["canUseColorPicker"]!!
        if (permissions.containsKey("canChangeCanvasSize")) collaboration.canChangeCanvasSize = permissions["canChangeCanvasSize"]!!

        posterRepository.save(poster)
        return ResponseEntity.ok("Permissions updated")
    }
    @GetMapping("/proxy")
    fun proxyImage(@RequestParam url: String, @AuthenticationPrincipal userDetails: UserDetails): ResponseEntity<ByteArray> {
        return try {
            val connection = URL(url).openConnection()
            connection.setRequestProperty("User-Agent", "Mozilla/5.0")
            connection.connectTimeout = 5000
            connection.readTimeout = 5000
            
            val contentType = connection.contentType ?: "image/jpeg"
            val bytes = connection.getInputStream().use { it.readBytes() }
            
            ResponseEntity.ok()
                .contentType(MediaType.parseMediaType(contentType))
                .body(bytes)
        } catch (e: Exception) {
            ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build()
        }
    }
}
