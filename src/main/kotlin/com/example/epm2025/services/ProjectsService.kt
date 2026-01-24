package com.example.epm2025.services

import com.example.epm2025.models.Project
import java.util.UUID

interface ProjectsService {
    fun getAllProjects() : List<Project>
    fun getProjectById(id: UUID) : Project?
    fun saveProject(project: Project) : Project
    fun deleteProject(project: Project)
}