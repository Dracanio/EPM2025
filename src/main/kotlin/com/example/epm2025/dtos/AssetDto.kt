package com.example.epm2025.dtos

import java.util.UUID

class AssetDto(
    val id: UUID,
    val fileName: String,
    val fileType: String,
    val url: String,
)