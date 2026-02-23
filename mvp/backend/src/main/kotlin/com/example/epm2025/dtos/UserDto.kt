package com.example.epm2025.dtos

import com.example.epm2025.models.Role
import jakarta.validation.constraints.Email
import jakarta.validation.constraints.NotBlank
import jakarta.validation.constraints.Size

class UserDto {
    @Email
    @Size(min = 5, max =100)
    var email: String = ""
    @Size(min = 1, max =30)
    @NotBlank
    var firstName: String = ""
    @Size(min = 1, max =30)
    @NotBlank
    var lastName: String = ""
    var role : Role? = null

    var passwordHash = "123"
}