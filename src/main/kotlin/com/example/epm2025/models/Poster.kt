package com.example.epm2025.models

import jakarta.persistence.CascadeType
import jakarta.persistence.Entity
import jakarta.persistence.FetchType
import jakarta.persistence.Id
import jakarta.persistence.ManyToOne
import jakarta.persistence.OneToMany
import java.time.LocalDateTime
import java.util.UUID

@Entity
class Poster {
    @Id
    open val id : UUID = UUID.randomUUID()
    var name: String = ""
    var width: Int = 0
    var height: Int = 0
    var status: PosterStatus = PosterStatus.DRAFT
    val createdAt: LocalDateTime = LocalDateTime.now()
    var updatedAt: LocalDateTime = LocalDateTime.now()
    @ManyToOne(fetch = FetchType.LAZY)
    lateinit var project: Project
    @OneToMany(mappedBy = "poster", cascade = [CascadeType.ALL], orphanRemoval = true)
    val elements: MutableList<Element> = mutableListOf()
}