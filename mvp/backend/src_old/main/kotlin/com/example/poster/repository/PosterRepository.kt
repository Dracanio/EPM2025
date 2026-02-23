package com.example.poster.repository

import com.example.poster.model.Poster
import org.springframework.data.jpa.repository.JpaRepository

interface PosterRepository : JpaRepository<Poster, Long> {
    @org.springframework.data.jpa.repository.Query("SELECT p FROM Poster p LEFT JOIN p.collaborations c WHERE p.user.id = :userId OR c.user.id = :userId")
    fun findByUserId(userId: Long): List<Poster>
}
