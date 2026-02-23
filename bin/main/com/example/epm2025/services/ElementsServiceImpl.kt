package com.example.epm2025.services

import com.example.epm2025.models.Element
import com.example.epm2025.repositories.ElementsRepository
import org.springframework.data.repository.findByIdOrNull
import java.util.UUID
import org.springframework.stereotype.Service

@Service
class ElementsServiceImpl (private val elementsRepository: ElementsRepository) : ElementsService {
    override fun getAllElements(): List<Element> {
        return elementsRepository.findAll().toList()
    }

    override fun getElementById(id: UUID): Element? {
        return elementsRepository.findByIdOrNull(id)
    }

    override fun saveElement(element: Element) : Element {
        return elementsRepository.save(element)
    }

    override fun deleteElement(element: Element) {
        elementsRepository.delete(element)
    }
}