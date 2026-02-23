package com.example.epm2025.models

import com.fasterxml.jackson.annotation.JsonIgnore
import jakarta.persistence.*
import java.util.*

@Entity
@Table(name = "poster_collaborations")
open class PosterCollaboration {
    @Id
    open var id: UUID = UUID.randomUUID()

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "poster_id", nullable = false)
    @JsonIgnore
    open var poster: Poster? = null

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "user_id", nullable = false)
    open var user: User? = null

    @Column(nullable = false)
    open var canAddElements: Boolean = true

    @Column(nullable = false)
    open var canDeleteElements: Boolean = true

    @Column(nullable = false)
    open var canAddLinkImages: Boolean = true

    @Column(nullable = false)
    open var canExport: Boolean = true

    @Column(nullable = false)
    open var canUseColorPicker: Boolean = true

    @Column(nullable = false)
    open var canChangeCanvasSize: Boolean = true
}
