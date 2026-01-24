package com.example.epm2025.models

import jakarta.persistence.Entity

@Entity
class TextElement : Element() {

    var text: String = ""
    var font: String = ""
    var fontSize: Int = 12
    var color: String = "#000000"
    var alignment: String = "LEFT"
}