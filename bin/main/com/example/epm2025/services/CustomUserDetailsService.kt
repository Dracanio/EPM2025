package com.example.epm2025.services

import com.example.epm2025.models.UserPrincipal
import com.example.epm2025.repositories.UsersRepository
import org.springframework.security.core.userdetails.UserDetails
import org.springframework.security.core.userdetails.UserDetailsService
import org.springframework.security.core.userdetails.UsernameNotFoundException
import org.springframework.stereotype.Service

@Service
class CustomUserDetailsService(private val usersRepository: UsersRepository) : UserDetailsService {

    override fun loadUserByUsername(username: String): UserDetails {
        println("Loading user from DB: $username")
        val user = usersRepository.findByEmail(username)
            ?: throw UsernameNotFoundException("User not found")

        return UserPrincipal(user)
    }
}