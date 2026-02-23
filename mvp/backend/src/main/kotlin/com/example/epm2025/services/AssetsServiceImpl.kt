package com.example.epm2025.services

import com.example.epm2025.models.Asset
import com.example.epm2025.repositories.AssetRepository
import org.springframework.data.repository.findByIdOrNull
import org.springframework.stereotype.Service
import java.util.UUID

@Service
class AssetsServiceImpl (private val assetRepository: AssetRepository) : AssetsService {
    override fun getAssetById(id: UUID): Asset? {
        return assetRepository.findByIdOrNull(id)
    }

    override fun saveAsset(asset: Asset): Asset {
        return assetRepository.save(asset)
    }

    override fun deleteAsset(asset: Asset) {
        assetRepository.delete(asset)
    }

    override fun getAllAssets(): List<Asset> {
        return assetRepository.findAll().toList()
    }
}