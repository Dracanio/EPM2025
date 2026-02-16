//package com.example.epm2025.controller
//
//import com.example.epm2025.dtos.UserDto
//import com.example.epm2025.models.Role
//import com.example.epm2025.models.UserPrincipal
//import com.example.epm2025.services.UsersService
//import jakarta.validation.Valid
//import org.springframework.http.MediaType
//import org.springframework.security.core.annotation.AuthenticationPrincipal
//import org.springframework.stereotype.Controller
//import org.springframework.ui.Model
//import org.springframework.validation.BindingResult
//import org.springframework.web.bind.annotation.*
//import org.springframework.web.servlet.mvc.support.RedirectAttributes
//import java.util.*
//
//@Controller
//@RequestMapping(produces = [MediaType.TEXT_HTML_VALUE])
//class UsersController(private val usersRestController : UsersRestController, private val usersService: UsersService)  {


//    @GetMapping("/dashboard")
//    fun getDashboard(model: Model, @AuthenticationPrincipal userPrincipal: UserPrincipal):String{
//        val user = usersService.findByEmail(userPrincipal.username)
//
//        return "/"
//    }
//    @GetMapping("/account")
//    fun getAccount(model: Model, @AuthenticationPrincipal userPrincipal: UserPrincipal):String{
//        val user = usersService.findByEmail(userPrincipal.username)
//        model.addAttribute("user", user)
//        return "/"
//    }
//
//    @GetMapping("/")
//    fun home(): String {
//        return "index.html"
//    }
//
//    @GetMapping("/register")
//    fun showRegisterForm(model: Model): String {
//        return "login/register"
//    }
//    @PostMapping("/register")
//    fun register(@Valid @ModelAttribute userDto: UserDto, bindingResult: BindingResult, redirectAttributes: RedirectAttributes): String {
//        if(bindingResult.hasErrors()){
//            redirectAttributes.addFlashAttribute("errors",bindingResult)
//        } else {
//            usersRestController.saveUser(userDto)
//        }
//        return "redirect:/"
//    }
//
//    @GetMapping("/login")
//    fun showLoginForm(model: Model): String {
//        return "/login"
//    }
//    @PostMapping("/login")
//    fun login(): String {
//        return "redirect:/"
//    }
//
//    @PostMapping("/users")
//    fun saveUser(@Valid @ModelAttribute userDto: UserDto, bindingResult: BindingResult, redirectAttributes: RedirectAttributes): String {
//        if(bindingResult.hasErrors()){
//            redirectAttributes.addFlashAttribute("errors",bindingResult)
//        } else {
//            usersRestController.saveUser(userDto)
//        }
//        return "redirect:/"
//    }
//
//    @GetMapping("/users")
//    fun getUsers(model: Model, @AuthenticationPrincipal userPrincipal: UserPrincipal): String {
//        val users = usersRestController.getUsers()
//        val user = usersService.findByEmail(userPrincipal.username)
//        model.addAttribute("users", users)
//        model.addAttribute("user",user)
//            return "users/showUsers"
//
//    }
//
//    @GetMapping("/users/{id}")
//    fun getUserById(model : Model, @PathVariable("id") id : UUID,@AuthenticationPrincipal userPrincipal: UserPrincipal) : String {
//        val me = usersService.findByEmail(userPrincipal.username)
//        val user = usersRestController.getUserById(id)
//        model.addAttribute("user",user)
//        model.addAttribute("currentUser",me)
//        return "users/showUser"
//    }
//
//    @PutMapping("/users/{id}")
//    fun updateUser(model : Model,@PathVariable id: UUID, @Valid @ModelAttribute userDto: UserDto, bindingResult: BindingResult,
//                   redirectAttributes: RedirectAttributes) :String {
//        if(bindingResult.hasErrors()){
//            println("error")
//            redirectAttributes.addFlashAttribute("errors",bindingResult)
//            return "redirect:/users/{id}"
//        } else {
//            val user = usersRestController.getUserById(id)
//            user.lastName = userDto.lastName
//            user.firstName = userDto.firstName
//            user.email = userDto.email
//            user.role = userDto.role
//            usersService.saveUser(user)
//            return "redirect:/users"
//        }
//    }
//    @DeleteMapping("/users/{id}")
//    fun deleteUser(@PathVariable("id") id: UUID) :String {
//        usersRestController.deleteUser(id)
//        return "redirect:/users"
//    }

//}