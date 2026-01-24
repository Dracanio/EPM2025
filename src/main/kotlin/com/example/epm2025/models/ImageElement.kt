package com.example.epm2025.models

import jakarta.persistence.Entity
import jakarta.persistence.FetchType
import jakarta.persistence.ManyToOne

@Entity
class ImageElement : Element() {

    @ManyToOne(fetch = FetchType.LAZY)
    lateinit var asset: Asset
}