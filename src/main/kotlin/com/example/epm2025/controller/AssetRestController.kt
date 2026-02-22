package com.example.epm2025.controller

import com.example.epm2025.dtos.AssetDto
import com.example.epm2025.models.Asset
import com.example.epm2025.services.AssetsService
import org.springframework.http.HttpStatus
import org.springframework.http.MediaType
import org.springframework.web.bind.annotation.DeleteMapping
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.PathVariable
import org.springframework.web.bind.annotation.PostMapping
import org.springframework.web.bind.annotation.PutMapping
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.ResponseStatus
import org.springframework.web.bind.annotation.RestController
import org.springframework.web.server.ResponseStatusException
import java.util.UUID

@RestController
@RequestMapping("/api/v1/", produces = [MediaType.APPLICATION_JSON_VALUE, MediaType.APPLICATION_XML_VALUE])
class AssetRestController(private val assetsService: AssetsService){

    @PostMapping("/assets")
    @ResponseStatus(HttpStatus.CREATED)
    fun saveAsset(assetDto: AssetDto): Asset {
        val asset = Asset()
        asset.url = assetDto.url
        asset.fileName = assetDto.fileName
        asset.fileType = assetDto.fileType
        return assetsService.saveAsset(asset)
    }
    @GetMapping("/assets/{id}")
    fun getAssetById(@PathVariable id: UUID): Asset {
        val asset = assetsService.getAssetById(id)
        if (asset != null) {
            return asset
        }
        else {
            throw ResponseStatusException(HttpStatus.NOT_FOUND)
        }
    }
    @GetMapping("/assets")
    fun getAllAssets(): List<Asset> {
        return assetsService.getAllAssets()
    }
    @PutMapping("/assets/{id}")
    fun updateAsset(@PathVariable id : UUID, assetDto: AssetDto): Asset {
        val asset = assetsService.getAssetById(id)
        if (asset != null) {
            asset.fileName = assetDto.fileName
            asset.fileType = assetDto.fileType
            asset.url = assetDto.url
            return assetsService.saveAsset(asset)
        }
        else {
            throw ResponseStatusException(HttpStatus.NOT_FOUND)
        }
    }
    @DeleteMapping("/assets/{id}")
    fun deleteAsset(@PathVariable id: UUID) {
        val asset = assetsService.getAssetById(id)
        if (asset != null) {
            assetsService.deleteAsset(asset)
        }
        else {
            throw ResponseStatusException(HttpStatus.NOT_FOUND)
        }
    }
}