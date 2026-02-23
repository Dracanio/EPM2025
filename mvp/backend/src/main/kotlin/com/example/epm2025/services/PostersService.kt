package com.example.epm2025.services

import com.example.epm2025.models.Poster
import com.example.epm2025.models.User
import java.util.UUID

interface PostersService {
    fun getAllPosters() : List<Poster>
    fun getPosterById(id: UUID) : Poster?
    fun getByProject(projectId: UUID) : List<Poster>?
    fun savePoster(poster: Poster) : Poster
    fun deletePoster(poster: Poster)
    fun getByOwner(user: User) : List<Poster>
    fun getPostersByCollaborator(user: User): List<Poster>
}