package com.example.epm2025.models

import jakarta.persistence.Entity
import jakarta.persistence.Id
import java.time.LocalDateTime
import java.util.UUID
import java.util.UUID.randomUUID

@Entity
class Asset {
    @Id
    open val id : UUID = UUID.randomUUID()
    var fileName: String = ""
    var fileType: String = ""
    var fileSize: Long = 0
    var uploadedBy: UUID = randomUUID()
    var url: String = ""
    val createdAt: LocalDateTime = LocalDateTime.now()
}