package com.example.epm2025.models

import org.springframework.security.core.GrantedAuthority
import org.springframework.security.core.authority.SimpleGrantedAuthority
import org.springframework.security.core.userdetails.UserDetails
import java.util.Collections

class UserPrincipal (private val user: User) : UserDetails {
    override fun getAuthorities(): MutableCollection<out GrantedAuthority> {
        if(user.role == Role.STUDENT){
            return  Collections.singleton(SimpleGrantedAuthority("STUDENT"))
        }else if(user.role == Role.ADMIN){
            return  Collections.singleton(SimpleGrantedAuthority("ADMIN"))
        }else if(user.role == Role.LECTURER){
            return  Collections.singleton(SimpleGrantedAuthority("LECTURER"))
        }else{
            return  Collections.singleton(SimpleGrantedAuthority("USER"))
        }
    }

    override fun getPassword(): String {
        return user.passwordHash
    }

    override fun getUsername(): String {
        return user.email
    }
}