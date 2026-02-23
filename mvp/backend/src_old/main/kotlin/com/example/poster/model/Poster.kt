package com.example.poster.model

import com.fasterxml.jackson.annotation.JsonIgnore
import jakarta.persistence.*

@Entity
@Table(name = "posters")
data class Poster(
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    val id: Long = 0,

    @Column(nullable = false)
    var title: String = "Untitled",

    @Lob
    @Column(columnDefinition = "CLOB")
    var contentJson: String = "{}",

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    @JsonIgnore
    var user: User? = null,

    @Column(nullable = false)
    var updatedAt: java.time.LocalDateTime = java.time.LocalDateTime.now(),

    @OneToMany(mappedBy = "poster", cascade = [CascadeType.ALL], orphanRemoval = true, fetch = FetchType.LAZY)
    @JsonIgnore
    var collaborations: MutableList<PosterCollaboration> = mutableListOf()
) {
    @get:com.fasterxml.jackson.annotation.JsonProperty("ownerUsername")
    val ownerUsername: String
        get() = user?.username ?: "Unknown"

    @get:com.fasterxml.jackson.annotation.JsonProperty("ownerId")
    val ownerId: Long
        get() = user?.id ?: -1
}
