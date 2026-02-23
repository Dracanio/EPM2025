package com.example.epm2025.services

import com.example.epm2025.models.UserPrincipal
import org.springframework.security.core.userdetails.UserDetails
import org.springframework.security.core.userdetails.UserDetailsService
import org.springframework.security.core.userdetails.UsernameNotFoundException
import org.springframework.stereotype.Service

@Service
class UserPrincipalService(private val usersService: UsersService) : UserDetailsService {

    override fun loadUserByUsername(username: String): UserDetails {
        val user = usersService.findByEmail(username)
            ?: throw UsernameNotFoundException("User not found")

        return UserPrincipal(user)
    }
}