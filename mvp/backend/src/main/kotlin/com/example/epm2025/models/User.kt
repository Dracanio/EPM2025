package com.example.epm2025.models

import jakarta.persistence.*
import java.util.*

@Entity
@Table(name = "app_user")
open class User {
    @Id
    open val id : UUID = UUID.randomUUID()
    open var email: String = ""
    open var firstName: String = ""
    open var lastName: String = ""
    open var role :Role? = null
    open var passwordHash: String = "123"
}