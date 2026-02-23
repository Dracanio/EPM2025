package com.example.epm2025.models

import jakarta.persistence.CascadeType
import jakarta.persistence.Entity
import jakarta.persistence.Id
import jakarta.persistence.ManyToOne
import jakarta.persistence.OneToMany
import java.time.LocalDateTime
import java.util.UUID

@Entity
class Poster {
    @Id
    val id : UUID = UUID.randomUUID()
    var name: String = ""
    var width: Float = 0F
    var height: Float = 0F
    @jakarta.persistence.Lob
    @jakarta.persistence.Column(columnDefinition = "CLOB")
    var contentJson: String = "{}"
    var status: PosterStatus = PosterStatus.DRAFT
    val createdAt: LocalDateTime = LocalDateTime.now()
    var updatedAt: LocalDateTime = LocalDateTime.now()
    @ManyToOne
    var owner: User? = null
    @ManyToOne
    var project: Project? = null
    @OneToMany(mappedBy = "poster", cascade = [CascadeType.ALL], orphanRemoval = true)
    val elements: MutableList<Element> = mutableListOf()

    @OneToMany(mappedBy = "poster", cascade = [CascadeType.ALL], orphanRemoval = true)
    val collaborations: MutableList<PosterCollaboration> = mutableListOf()

    fun addElement(element: Element) {
        elements.add(element)
        element.poster = this
    }

    fun removeElement(element: Element) {
        elements.remove(element)
        element.poster = null
    }

    fun clearElements() {
        elements.forEach { it.poster = null }
        elements.clear()
    }
}