package com.example.epm2025.models

import jakarta.persistence.Entity
import jakarta.persistence.EnumType
import jakarta.persistence.Enumerated
import jakarta.persistence.FetchType
import jakarta.persistence.Id
import jakarta.persistence.ManyToOne
import java.util.UUID

@Entity
class Collaborator {
    @Id
    open val id : UUID = UUID.randomUUID()

    @ManyToOne(fetch = FetchType.LAZY)
    val user: User = TODO()

    @ManyToOne(fetch = FetchType.LAZY)
    val project: Project = TODO()

    open var collabRole : CollabRole? = null
}