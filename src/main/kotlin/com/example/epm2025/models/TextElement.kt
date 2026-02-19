package com.example.epm2025.models

import jakarta.persistence.DiscriminatorValue
import jakarta.persistence.Entity

@Entity
@DiscriminatorValue("TEXT")
open class TextElement : Element() {

    open var text: String = ""
    open var font: String = ""
    open var fontSize: Int = 12
    open var color: String = "#000000"
    open var alignment: String = "LEFT"
}