package com.example.poster

import org.springframework.boot.autoconfigure.SpringBootApplication
import org.springframework.boot.runApplication

@SpringBootApplication
class PosterApplication

fun main(args: Array<String>) {
	runApplication<PosterApplication>(*args)
}
