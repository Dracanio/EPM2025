package com.example.epm2025.services

import com.example.epm2025.models.Asset
import java.util.UUID

interface AssetsService {
    fun getAssetById(id: UUID): Asset?
    fun saveAsset(asset: Asset) : Asset
    fun deleteAsset(asset: Asset)
    fun getAllAssets(): List<Asset>
}