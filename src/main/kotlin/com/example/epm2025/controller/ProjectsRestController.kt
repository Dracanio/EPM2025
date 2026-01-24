package com.example.epm2025.controller

import com.example.epm2025.dtos.ProjectDto
import com.example.epm2025.services.ProjectsService
import com.example.epm2025.models.Project
import jakarta.validation.Valid
import org.springframework.http.MediaType
import org.springframework.web.bind.annotation.DeleteMapping
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.PathVariable
import org.springframework.web.bind.annotation.PostMapping
import org.springframework.web.bind.annotation.RequestBody
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RestController
import java.util.UUID

@RestController
@RequestMapping("/api/v1", produces = [MediaType.APPLICATION_JSON_VALUE, MediaType.APPLICATION_XML_VALUE])
class ProjectController( private val projectsService: ProjectsService) {

    @PostMapping("/projects")
    fun saveProject(@Valid @RequestBody projectDto: ProjectDto) {
        val project = Project()
        project.name = projectDto.name
        projectsService.saveProject(project)
    }

    @GetMapping("/projects")
    fun getAll(): List<Project> =
        projectsService.getAllProjects()

    @GetMapping("/projects/{id}")
    fun getById(@PathVariable id: UUID) : Project{
        val project = projectsService.getProjectById(id)
        return project!!
    }

    @DeleteMapping("/projects/{id}")
    fun deleteProject(@PathVariable id: UUID) {
        val project = projectsService.getProjectById(id)
        projectsService.deleteProject(project!!)
    }

}