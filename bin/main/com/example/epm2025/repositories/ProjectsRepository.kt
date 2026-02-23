package com.example.epm2025.repositories

import com.example.epm2025.models.Project
import org.springframework.data.repository.CrudRepository
import org.springframework.stereotype.Repository
import java.util.UUID

@Repository
interface ProjectsRepository : CrudRepository<Project, UUID> {
}