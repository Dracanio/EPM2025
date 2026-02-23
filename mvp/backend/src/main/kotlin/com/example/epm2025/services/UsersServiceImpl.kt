package com.example.epm2025.services

import com.example.epm2025.models.User
import com.example.epm2025.repositories.UsersRepository
import org.springframework.data.repository.findByIdOrNull
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder
import org.springframework.stereotype.Service
import java.util.*

@Service
class UsersServiceImpl (private val usersRepository: UsersRepository) : UsersService {
    val encoder = BCryptPasswordEncoder(10)
    override fun getUserById(id: UUID): User? {
        return usersRepository.findByIdOrNull(id)
    }

    override fun getAllUsers(): List<User> {
        return usersRepository.findAll().toList()
    }

    override fun saveUser(user: User): User {
        user.passwordHash = encoder.encode(user.passwordHash)!!
        return usersRepository.save(user)
    }

    override fun deleteUser(user: User) {
        usersRepository.delete(user)
    }


    override fun findByEmail(string: String): User {
        return usersRepository.findByEmail(string)!!
    }

}