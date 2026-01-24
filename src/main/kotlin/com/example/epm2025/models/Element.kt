package com.example.epm2025.models

import jakarta.persistence.Entity
import jakarta.persistence.FetchType
import jakarta.persistence.GeneratedValue
import jakarta.persistence.Id
import jakarta.persistence.ManyToOne
import java.util.UUID

@Entity
abstract class Element {
    @Id
    @GeneratedValue
    open var id : UUID = UUID.randomUUID()
    var x: Float = 0f
    var y: Float = 0f
    var width: Float = 0f
    var height: Float = 0f
    var rotation: Float = 0f

    @ManyToOne(fetch = FetchType.LAZY)
    lateinit var poster: Poster
}