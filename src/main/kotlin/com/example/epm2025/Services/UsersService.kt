package com.example.epm2025.services

import com.example.epm2025.models.User
import java.util.*

interface UsersService {
    fun getUserById(id: UUID): User?
    fun getAllUsers(): List<User>
    fun saveUser(user: User): User
    fun deleteUser(user: User)
    fun findByEmail(string: String) :User
}