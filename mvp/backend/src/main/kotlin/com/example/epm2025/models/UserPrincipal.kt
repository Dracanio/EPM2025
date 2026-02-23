package com.example.epm2025.models

import org.springframework.security.core.GrantedAuthority
import org.springframework.security.core.authority.SimpleGrantedAuthority
import org.springframework.security.core.userdetails.UserDetails
import java.util.Collections

class UserPrincipal (private val user: User) : UserDetails {
    override fun getAuthorities(): MutableCollection<out GrantedAuthority> {
        val roleName = when (user.role) {
            Role.STUDENT -> "ROLE_STUDENT"
            Role.ADMIN -> "ROLE_ADMIN"
            Role.LECTURER -> "ROLE_LECTURER"
            else -> "ROLE_USER"
        }
        return Collections.singleton(SimpleGrantedAuthority(roleName))
    }

    override fun getPassword(): String {
        return user.passwordHash
    }

    override fun getUsername(): String {
        return user.email
    }
    fun getUser(): User = user

}