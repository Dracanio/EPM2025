package com.example.epm2025.models

import com.fasterxml.jackson.annotation.JsonSubTypes
import com.fasterxml.jackson.annotation.JsonTypeInfo
import jakarta.persistence.Entity
import jakarta.persistence.FetchType
import jakarta.persistence.GeneratedValue
import jakarta.persistence.Id
import jakarta.persistence.Inheritance
import jakarta.persistence.InheritanceType
import jakarta.persistence.ManyToOne
import java.util.UUID

@Entity
@Inheritance(strategy = InheritanceType.JOINED)
@JsonTypeInfo(
    use = JsonTypeInfo.Id.NAME,
    include = JsonTypeInfo.As.PROPERTY,
    property = "type"
)
@JsonSubTypes(
    JsonSubTypes.Type(value = TextElement::class, name = "TEXT"),
    JsonSubTypes.Type(value = ImageElement::class, name = "IMAGE")
)
abstract class Element {
    @Id
    open var id : UUID = UUID.randomUUID()
    var x: Float = 0f
    var y: Float = 0f
    var width: Float = 0f
    var height: Float = 0f
    var rotation: Float = 0f

    @ManyToOne(fetch = FetchType.LAZY)
    var poster: Poster? = null
}