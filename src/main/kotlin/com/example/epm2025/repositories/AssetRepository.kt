package com.example.epm2025.repositories

import com.example.epm2025.models.Asset
import org.springframework.data.repository.CrudRepository
import org.springframework.stereotype.Repository
import java.util.UUID

@Repository
interface AssetRepository : CrudRepository<Asset, UUID> {
    fun getReferenceById(id: UUID) :Asset
}