package com.example.epm2025.repositories

import com.example.epm2025.models.Poster
import org.springframework.data.repository.CrudRepository
import org.springframework.stereotype.Repository
import java.util.UUID

@Repository
interface PostersRepository : CrudRepository<Poster, UUID> {
    fun findAllByProjectId(projectId: UUID): List<Poster>
}