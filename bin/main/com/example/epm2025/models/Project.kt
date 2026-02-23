package com.example.epm2025.models

import jakarta.persistence.Entity
import jakarta.persistence.Id
import jakarta.persistence.ManyToMany
import jakarta.persistence.ManyToOne
import jakarta.persistence.OneToMany
import java.time.LocalDateTime
import java.util.UUID

@Entity
class Project {
    @Id
    val id : UUID = UUID.randomUUID()
    var name: String = ""
    val createdAt: LocalDateTime = LocalDateTime.now()
    var updatedAt: LocalDateTime = LocalDateTime.now()
//    @OneToMany(mappedBy = "project", cascade = [CascadeType.ALL], orphanRemoval = true)
//    val collaborators: MutableList<Collaborator> = mutableListOf()
    @ManyToOne
    var owner: User? = null
    @ManyToMany
    var collaborators: MutableSet<User> = mutableSetOf()
    @OneToMany(mappedBy = "project")
    var posters: MutableList<Poster> = mutableListOf()
}