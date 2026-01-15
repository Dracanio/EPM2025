package com.example.epm2025.repositories

import com.example.epm2025.models.User
import org.springframework.data.repository.CrudRepository
import org.springframework.stereotype.Repository
import java.util.*

@Repository
interface UsersRepository : CrudRepository<User, UUID> {
    fun findByEmail(email: String): User?
}