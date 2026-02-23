package com.example.epm2025.repositories

import com.example.epm2025.models.PosterCollaboration
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.stereotype.Repository
import java.util.*

@Repository
interface PosterCollaborationRepository : JpaRepository<PosterCollaboration, UUID> {
    fun findByPosterId(posterId: UUID): List<PosterCollaboration>
    fun findByPosterIdAndUserId(posterId: UUID, userId: UUID): PosterCollaboration?
    fun findByUserId(userId: UUID): List<PosterCollaboration>
}
