package com.example.epm2025.services

import com.example.epm2025.models.Poster
import com.example.epm2025.models.User
import com.example.epm2025.repositories.PostersRepository
import org.springframework.data.repository.findByIdOrNull
import java.util.UUID
import org.springframework.stereotype.Service

@Service
class PostersServiceImpl( private val postersRepository: PostersRepository) : PostersService {
    override fun getAllPosters(): List<Poster> {
        return postersRepository.findAll().toList()
    }

    override fun getPosterById(id: UUID): Poster? {
        return postersRepository.findByIdOrNull(id)
    }

    override fun getByProject(projectId: UUID): List<Poster>? {
        return postersRepository.findAllByProjectId(projectId)
    }

    override fun savePoster(poster: Poster) : Poster {
        return postersRepository.save(poster)
    }

    override fun deletePoster(poster: Poster) {
        postersRepository.delete(poster)
    }

    override fun getByOwner(user: User): List<Poster> {
        return postersRepository.getPostersByOwner(user)
    }
}