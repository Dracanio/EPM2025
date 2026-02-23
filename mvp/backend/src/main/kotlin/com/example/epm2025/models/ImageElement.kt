package com.example.epm2025.models

import jakarta.persistence.DiscriminatorValue
import jakarta.persistence.Entity
import jakarta.persistence.FetchType
import jakarta.persistence.ManyToOne

@Entity
@DiscriminatorValue("IMAGE")
open class ImageElement : Element() {

    @ManyToOne(fetch = FetchType.LAZY)
    open lateinit var asset: Asset
}