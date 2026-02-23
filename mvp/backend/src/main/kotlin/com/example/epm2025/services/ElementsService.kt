package com.example.epm2025.services

import com.example.epm2025.models.Element
import java.util.UUID

interface ElementsService {
    fun getAllElements() : List<Element>
    fun getElementById(id: UUID) : Element?
    fun saveElement(element: Element) : Element
    fun deleteElement(element: Element)
}