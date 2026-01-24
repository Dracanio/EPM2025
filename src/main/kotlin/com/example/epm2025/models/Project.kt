package com.example.epm2025.models

import jakarta.persistence.CascadeType
import jakarta.persistence.Entity
import jakarta.persistence.Id
import jakarta.persistence.OneToMany
import java.time.LocalDateTime
import java.util.UUID

@Entity
class Project {
    @Id
    open val id : UUID = UUID.randomUUID()
    open var name: String = ""
    val createdAt: LocalDateTime = LocalDateTime.now()
    var updatedAt: LocalDateTime = LocalDateTime.now()
    @OneToMany(mappedBy = "project", cascade = [CascadeType.ALL], orphanRemoval = true)
    val collaborators: MutableList<Collaborator> = mutableListOf()
    @OneToMany(mappedBy = "project")
    var posters: MutableList<Poster> = mutableListOf()
}