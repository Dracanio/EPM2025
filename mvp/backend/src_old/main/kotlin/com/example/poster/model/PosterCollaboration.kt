package com.example.poster.model

import com.fasterxml.jackson.annotation.JsonIgnore
import jakarta.persistence.*

@Entity
@Table(name = "poster_collaborations")
data class PosterCollaboration(
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    val id: Long = 0,

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "poster_id", nullable = false)
    @JsonIgnore
    var poster: Poster? = null,

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "user_id", nullable = false)
    var user: User? = null,

    @Column(nullable = false)
    var canAddElements: Boolean = true,

    @Column(nullable = false)
    var canDeleteElements: Boolean = true,

    @Column(nullable = false)
    var canAddLinkImages: Boolean = true,

    @Column(nullable = false)
    var canExport: Boolean = true,

    @Column(nullable = false)
    var canUseColorPicker: Boolean = true,

    @Column(nullable = false)
    var canChangeCanvasSize: Boolean = true
)
