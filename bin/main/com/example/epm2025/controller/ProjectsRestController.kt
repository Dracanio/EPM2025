package com.example.epm2025.controller

import com.example.epm2025.dtos.ProjectDto
import com.example.epm2025.services.ProjectsService
import com.example.epm2025.models.Project
import com.example.epm2025.models.UserPrincipal
import com.example.epm2025.services.UsersService
import jakarta.validation.Valid
import org.springframework.http.HttpStatus
import org.springframework.http.MediaType
import org.springframework.security.core.annotation.AuthenticationPrincipal
import org.springframework.web.bind.annotation.DeleteMapping
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.PathVariable
import org.springframework.web.bind.annotation.PostMapping
import org.springframework.web.bind.annotation.RequestBody
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RequestParam
import org.springframework.web.bind.annotation.RestController
import org.springframework.web.server.ResponseStatusException
import java.util.UUID

@RestController
@RequestMapping("/api/v1", produces = [MediaType.APPLICATION_JSON_VALUE, MediaType.APPLICATION_XML_VALUE])
class ProjectController( private val projectsService: ProjectsService, private val usersService: UsersService) {

    @PostMapping("/projects")
    fun saveProject(@Valid @RequestBody projectDto: ProjectDto, @AuthenticationPrincipal principal: UserPrincipal) {
        val user = usersService.findByEmail(principal.username)
        val project = Project()
        project.name = projectDto.name
        project.owner = user
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
    @PostMapping("/projects/{id}/invite")
    fun inviteUser(@PathVariable id: UUID, @RequestParam email: String, @AuthenticationPrincipal principal: UserPrincipal) {
        val project = projectsService.getProjectById(id) ?: throw ResponseStatusException(HttpStatus.NOT_FOUND)

        val currentUser = usersService.findByEmail(principal.username)

        if (project.owner?.id != currentUser.id) {
            throw ResponseStatusException(HttpStatus.FORBIDDEN)
        }

        val invitedUser = usersService.findByEmail(email)
        project.collaborators.add(invitedUser)

        projectsService.saveProject(project)
    }
}