package com.example.epm2025.services

import com.example.epm2025.models.Project
import com.example.epm2025.repositories.ProjectsRepository
import org.springframework.data.repository.findByIdOrNull
import java.util.UUID
import org.springframework.stereotype.Service

@Service
class ProjectsServiceImpl(private val projectsRepository: ProjectsRepository) : ProjectsService{
    override fun getAllProjects(): List<Project> {
        return projectsRepository.findAll().toList()
    }

    override fun getProjectById(id: UUID): Project? {
        return projectsRepository.findByIdOrNull(id)
    }

    override fun saveProject(project: Project) : Project {
        return projectsRepository.save(project)
    }

    override fun deleteProject(project: Project) {
        projectsRepository.delete(project)
    }
}