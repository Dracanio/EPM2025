package com.example.epm2025.controller

import com.example.epm2025.dtos.UserDto
import com.example.epm2025.models.User
import com.example.epm2025.models.UserPrincipal
import com.example.epm2025.services.UsersService
import jakarta.validation.Valid
import org.springframework.http.HttpStatus
import org.springframework.http.MediaType
import org.springframework.security.core.annotation.AuthenticationPrincipal
import org.springframework.web.bind.annotation.*
import org.springframework.web.server.ResponseStatusException
import java.util.*

@RestController
@RequestMapping("/api/v1", produces = [MediaType.APPLICATION_JSON_VALUE, MediaType.APPLICATION_XML_VALUE])
class UsersRestController (private val usersService: UsersService) {

    @PostMapping("/users")
    @ResponseStatus(HttpStatus.CREATED)
    fun saveUser(@Valid @RequestBody userDto: UserDto) {
        val user = User()
        user.email = userDto.email
        user.firstName = userDto.firstName
        user.lastName = userDto.lastName
        user.role = userDto.role
        user.passwordHash = userDto.passwordHash
        usersService.saveUser(user)
    }

    @GetMapping("/users")
    fun getUsers(): List<User> {
        return usersService.getAllUsers()
    }

    @GetMapping("/users/{id}")
    fun getUserById(@PathVariable("id") id : UUID) : User {

        val user: User? = usersService.getUserById(id)
        if(user != null) {
            return user
        }else{
            throw ResponseStatusException(HttpStatus.NOT_FOUND)
        }
    }

    @PutMapping("/users/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    fun updateUser(@Valid @RequestBody userDto: UserDto, @PathVariable id: UUID) {
        val user = usersService.getUserById(id)
        if (user != null) {
            user.email = userDto.email
            user.firstName = userDto.firstName
            user.lastName = userDto.lastName
            user.role = userDto.role
            usersService.saveUser(user)
        } else {
            throw ResponseStatusException(HttpStatus.NOT_FOUND)
        }
    }

    @DeleteMapping("/users/{id}")
    fun deleteUser(@PathVariable("id") id: UUID) {
        val user = usersService.getUserById(id)
        if (user != null) {
            usersService.deleteUser(user)
        } else {
            throw ResponseStatusException(HttpStatus.NOT_FOUND)
        }
    }

    @GetMapping("/me")
    fun getCurrentUser(@AuthenticationPrincipal userPrincipal: UserPrincipal): User {
        return usersService.findByEmail(userPrincipal.username)
    }
}