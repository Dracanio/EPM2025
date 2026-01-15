<script setup lang="ts">
import { useRouter } from 'vue-router'
import { useEditorStore } from '@/core/store/useEditorStore'
import type { Template } from '@/core/models/template'

const router = useRouter()
const editorStore = useEditorStore()

// Helper to create UUIDs for mock data
const uuid = () => crypto.randomUUID()

// TH Köln Colors
const cRed = '#dd1166'
const cDark = '#2B2B2B'
const cGray = '#555555'

// Mock Templates
const mockTemplates: Template[] = [
  {
    id: 't_a4_empty',
    name: 'Leeres A4 Poster',
    format: 'A4',
    allowedZones: [],
    pages: [{ elements: [] }],
    thumbnail: 'bg-white'
  },
  {
    id: 't_flyer_ar',
    name: 'Flyer: Ausstellung (AR)',
    format: 'Flyer',
    allowedZones: [],
    pages: [
      {
        elements: [
            // Header Image Placeholder
            {
                id: uuid(), type: 'image', name: 'Header Bild',
                xMm: 0, yMm: 0, widthMm: 100, heightMm: 70, rotationDeg: 0, locked: false,
                assetId: '', fit: 'cover', src: 'https://placehold.co/400x280/333/666?text=Header+Bild'
            },
            // Red Category Tag
            {
                id: uuid(), type: 'text', name: 'Kategorie',
                xMm: 10, yMm: 75, widthMm: 80, heightMm: 10, rotationDeg: 0, locked: false,
                text: 'Augmented Reality',
                variant: 'body', align: 'left', fontSize: 14, fontFamily: '"PT Sans", sans-serif',
                color: cRed, fontWeight: 'bold', fontStyle: 'normal', backgroundColor: 'transparent'
            },
            // Title
            {
                id: uuid(), type: 'text', name: 'Titel',
                xMm: 10, yMm: 82, widthMm: 80, heightMm: 30, rotationDeg: 0, locked: false,
                text: 'Die Meisterwerke von Lucas Cranach',
                variant: 'title', align: 'left', fontSize: 24, fontFamily: '"Roboto Slab", serif',
                color: cDark, fontWeight: 'bold', fontStyle: 'normal', backgroundColor: 'transparent'
            },
            // Body Text
            {
                id: uuid(), type: 'text', name: 'Beschreibung',
                xMm: 10, yMm: 110, widthMm: 80, heightMm: 60, rotationDeg: 0, locked: false,
                text: 'An dieser Station kann eine relativ neue Technologie ausprobiert werden: Virtual Reality im Webbrowser. Virtual Reality (VR) gibt es zwar schon lange, bisher war jedoch die Installation und Nutzung einer nativen Anwendung erforderlich.',
                variant: 'body', align: 'left', fontSize: 11, fontFamily: '"PT Sans", sans-serif',
                color: cGray, fontWeight: 'normal', fontStyle: 'normal', backgroundColor: 'transparent'
            },
            // Footer Box Black
            {
                id: uuid(), type: 'text', name: 'Footer Label',
                xMm: 0, yMm: 180, widthMm: 60, heightMm: 10, rotationDeg: 0, locked: false,
                text: 'Ansprechpartner',
                variant: 'body', align: 'left', fontSize: 10, fontFamily: '"PT Sans", sans-serif',
                color: cDark, fontWeight: 'normal', fontStyle: 'normal', backgroundColor: 'transparent'
            },
             {
                id: uuid(), type: 'text', name: 'Footer Name',
                xMm: 0, yMm: 188, widthMm: 70, heightMm: 8, rotationDeg: 0, locked: false,
                text: ' Christian Noss',
                variant: 'body', align: 'left', fontSize: 12, fontFamily: '"PT Sans", sans-serif',
                color: 'white', fontWeight: 'bold', fontStyle: 'normal', backgroundColor: cDark
            }
        ]
      }
    ],
    thumbnail: 'bg-gray-100'
  },
  {
    id: 't_a4_bachelor',
    name: 'Poster: Studiengang Info',
    format: 'A4', // Portrait
    allowedZones: [],
    pages: [
        {
            elements: [
                // Header Image
                {
                    id: uuid(), type: 'image', name: 'Header',
                    xMm: 0, yMm: 0, widthMm: 210, heightMm: 60, rotationDeg: 0, locked: false,
                    assetId: '', fit: 'cover', src: 'https://placehold.co/800x250/efefef/999?text=Studenten+Header'
                },
                // Title
                {
                    id: uuid(), type: 'text', name: 'Headline',
                    xMm: 20, yMm: 70, widthMm: 170, heightMm: 20, rotationDeg: 0, locked: false,
                    text: 'Medieninformatik\nBachelor',
                    variant: 'title', align: 'left', fontSize: 36, fontFamily: '"Roboto Slab", serif',
                    color: cDark, fontWeight: 'bold', fontStyle: 'normal', backgroundColor: 'transparent'
                },
                // Two Columns Text (Simulated as one for now or two text blocks)
                {
                    id: uuid(), type: 'text', name: 'Intro Text',
                    xMm: 20, yMm: 100, widthMm: 170, heightMm: 100, rotationDeg: 0, locked: false,
                    text: 'Die Menschen mit ihren Bedürfnissen stehen im Zentrum der Medieninformatik. Absolvent*innen unserer Medieninformatik-Studiengänge konzipieren und explorieren neue digitale Medien und interaktive digitale Produkte.\n\nSie sind in der Lage, ihr Wissen in anwendungsorientierten Projekten umzusetzen, wissenschaftlich fundierte Urteile abzuleiten und Lösungsansätze zu entwickeln.',
                    variant: 'body', align: 'left', fontSize: 14, fontFamily: '"PT Sans", sans-serif',
                    color: cGray, fontWeight: 'normal', fontStyle: 'normal', backgroundColor: 'transparent'
                },
                // Bottom Logo Area
                 {
                    id: uuid(), type: 'text', name: 'TH Logo Text',
                    xMm: 140, yMm: 260, widthMm: 50, heightMm: 20, rotationDeg: 0, locked: false,
                    text: 'Technology\nArts Sciences\nTH Köln',
                    variant: 'body', align: 'right', fontSize: 12, fontFamily: '"PT Sans", sans-serif',
                    color: cRed, fontWeight: 'bold', fontStyle: 'normal', backgroundColor: 'transparent'
                }
            ]
        }
    ],
    thumbnail: 'bg-white'
  },
    {
    id: 't_a4_moxd',
    name: 'Poster: Lab (moxd)',
    format: 'A4',
    allowedZones: [],
    pages: [
      {
        elements: [
           // Background Graphic Placeholder (Top)
           {
                id: uuid(), type: 'image', name: 'Network Graphic',
                xMm: 0, yMm: 0, widthMm: 210, heightMm: 100, rotationDeg: 0, locked: false,
                assetId: '', fit: 'cover', src: 'https://placehold.co/800x400/5952e1/fff?text=Network+Graphic'
            },
            // Title Block
            {
                id: uuid(), type: 'text', name: 'Lab Title',
                xMm: 20, yMm: 110, widthMm: 170, heightMm: 20, rotationDeg: 0, locked: false,
                text: 'moxd lab',
                variant: 'title', align: 'left', fontSize: 32, fontFamily: '"Roboto Slab", serif',
                color: cDark, fontWeight: 'bold', fontStyle: 'normal', backgroundColor: 'transparent'
            },
            {
                id: uuid(), type: 'text', name: 'Subtitle',
                xMm: 20, yMm: 125, widthMm: 170, heightMm: 20, rotationDeg: 0, locked: false,
                text: 'Lab for Mobile and Distributed\nInformation Technology',
                variant: 'subtitle', align: 'left', fontSize: 24, fontFamily: '"PT Sans", sans-serif',
                color: cGray, fontWeight: 'normal', fontStyle: 'normal', backgroundColor: 'transparent'
            },
            // List
            {
                id: uuid(), type: 'text', name: 'Bullet Points',
                xMm: 20, yMm: 150, widthMm: 170, heightMm: 50, rotationDeg: 0, locked: false,
                text: '– Teaching, building and studying distributed IT\n– Methods and concepts for developing distributed systems\n– Solving problems by making creative use of IT',
                variant: 'body', align: 'left', fontSize: 16, fontFamily: '"PT Sans", sans-serif',
                color: cGray, fontWeight: 'normal', fontStyle: 'normal', backgroundColor: 'transparent'
            }
        ]
      }
    ],
    thumbnail: 'bg-purple-50'
  }
]

function selectTemplate(template: Template) {
  editorStore.createPosterFromTemplate(template)
  if (editorStore.activePoster) {
      router.push(`/editor/${editorStore.activePoster.id}`)
  }
}
</script>

<template>
  <div class="min-h-screen bg-gray-50 p-8">
    <div class="max-w-6xl mx-auto">
      <h1 class="text-4xl font-bold text-gray-900 mb-2 font-headings">Neue Poster-Vorlage wählen</h1>
      <p class="text-gray-600 mb-8 font-body">Wählen Sie eine Vorlage im TH-Köln Design.</p>
      
      <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
        <div v-for="t in mockTemplates" :key="t.id" 
             class="group bg-white rounded-xl shadow-sm hover:shadow-xl transition-all duration-300 cursor-pointer overflow-hidden border border-gray-100 flex flex-col h-fit"
             @click="selectTemplate(t)">
          
          <!-- Preview Area -->
          <!-- Removed padding from container to allow content to fill properly -->
          <div :class="['w-full relative bg-white border-b border-gray-100 flex items-center justify-center overflow-hidden', t.format === 'A4 Landscape' ? 'aspect-[1.414/1]' : (t.format === 'Flyer' ? 'aspect-[1/2.1]' : 'aspect-[1/1.414]')]">
            
            <div class="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/5 z-10">
                <button class="bg-white text-gray-900 px-6 py-2 rounded-full font-medium shadow-lg transform translate-y-2 group-hover:translate-y-0 transition-transform">
                    Verwenden
                </button>
            </div>

            <!-- CSS Preview based on template ID -->
             <div class="h-full w-full flex flex-col pointer-events-none relative select-none">
                
                <div v-if="t.id === 't_a4_empty'" class="flex-1 border-2 border-dashed border-gray-200 m-4 rounded flex items-center justify-center text-gray-300">Leer</div>
                
                <div v-if="t.id === 't_flyer_ar'" class="flex flex-col h-full bg-white relative">
                    <div class="h-1/3 bg-gray-300 w-full mb-2"></div>
                    <div class="px-2">
                        <div class="h-1 bg-pink-600 w-1/2 mb-1"></div>
                        <div class="h-2 bg-gray-800 w-full mb-2"></div>
                        <div class="h-1 bg-gray-300 w-full mb-1"></div>
                        <div class="h-1 bg-gray-300 w-full mb-1"></div>
                    </div>
                </div>

                <div v-if="t.id === 't_a4_bachelor'" class="flex flex-col h-full bg-white">
                    <div class="h-1/4 bg-gray-200 w-full mb-4"></div>
                    <div class="px-4">
                        <div class="h-3 bg-gray-800 w-2/3 mb-4"></div>
                        <div class="h-1 bg-gray-300 w-full mb-2"></div>
                        <div class="h-1 bg-gray-300 w-full mb-2"></div>
                        <div class="h-1 bg-gray-300 w-4/5 mb-2"></div>
                    </div>
                </div>

                 <div v-if="t.id === 't_a4_moxd'" class="flex flex-col h-full bg-white">
                    <div class="h-1/3 bg-purple-100 w-full mb-4 relative overflow-hidden">
                         <div class="absolute inset-0 border-b-4 border-orange-500 opacity-50"></div>
                    </div>
                    <div class="px-4">
                        <div class="h-3 bg-gray-800 w-1/2 mb-2"></div>
                        <div class="h-2 bg-gray-500 w-3/4 mb-4"></div>
                        <div class="h-1 bg-gray-300 w-full mb-1"></div>
                        <div class="h-1 bg-gray-300 w-full mb-1"></div>
                    </div>
                </div>

             </div>
          </div>

          <!-- Footer -->
          <div class="p-4">
            <h3 class="font-bold text-gray-800 text-sm">{{ t.name }}</h3>
            <span class="text-xs text-gray-500 uppercase tracking-wide">{{ t.format }}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.font-headings {
    font-family: 'Roboto Slab', serif;
}
.font-body {
    font-family: 'PT Sans', sans-serif;
}
</style>
