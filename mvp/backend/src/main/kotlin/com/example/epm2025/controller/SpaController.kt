package com.example.epm2025.controller

import org.springframework.stereotype.Controller
import org.springframework.web.bind.annotation.GetMapping

@Controller
class SpaController {

    @GetMapping("/{path:[^\\.]*}")
    fun redirect(): String {
        return "forward:/index.html"
    }
}