<script setup lang="ts">
import { useRouter } from 'vue-router'
import { useEditorStore } from '@/core/store/useEditorStore'
import type { Template } from '@/core/models/template'
import AppFrame from '@/layouts/AppFrame.vue'
import SectionHeader from '@/components/ui/SectionHeader.vue'
import SectionCard from '@/components/ui/SectionCard.vue'

const router = useRouter()
const editorStore = useEditorStore()

const uuid = () => crypto.randomUUID()

const cRed = '#dd1166'
const cDark = '#2B2B2B'
const cGray = '#555555'

const mockTemplates: Template[] = [
  {
    id: 't_a4_empty',
    name: 'Leeres A4 Poster',
    format: 'A4',
    allowedZones: [],
    pages: [{ elements: [] }]
  },
  {
    id: 't_flyer_ar',
    name: 'Flyer: Ausstellung (AR)',
    format: 'Flyer',
    allowedZones: [],
    pages: [
      {
        elements: [
          {
            id: uuid(),
            type: 'image',
            name: 'Header Bild',
            xMm: 0,
            yMm: 0,
            widthMm: 100,
            heightMm: 70,
            rotationDeg: 0,
            locked: false,
            assetId: '',
            fit: 'cover',
            src: 'https://placehold.co/400x280/333/666?text=Header+Bild'
          },
          {
            id: uuid(),
            type: 'text',
            name: 'Kategorie',
            xMm: 10,
            yMm: 75,
            widthMm: 80,
            heightMm: 10,
            rotationDeg: 0,
            locked: false,
            text: 'Augmented Reality',
            variant: 'body',
            align: 'left',
            fontSize: 14,
            fontFamily: '"PT Sans", sans-serif',
            color: cRed,
            fontWeight: 'bold',
            fontStyle: 'normal',
            backgroundColor: 'transparent'
          },
          {
            id: uuid(),
            type: 'text',
            name: 'Titel',
            xMm: 10,
            yMm: 82,
            widthMm: 80,
            heightMm: 30,
            rotationDeg: 0,
            locked: false,
            text: 'Die Meisterwerke von Lucas Cranach',
            variant: 'title',
            align: 'left',
            fontSize: 24,
            fontFamily: '"Roboto Slab", serif',
            color: cDark,
            fontWeight: 'bold',
            fontStyle: 'normal',
            backgroundColor: 'transparent'
          },
          {
            id: uuid(),
            type: 'text',
            name: 'Beschreibung',
            xMm: 10,
            yMm: 110,
            widthMm: 80,
            heightMm: 60,
            rotationDeg: 0,
            locked: false,
            text:
              'An dieser Station kann eine relativ neue Technologie ausprobiert werden: Virtual Reality im Webbrowser. Virtual Reality (VR) gibt es zwar schon lange, bisher war jedoch die Installation und Nutzung einer nativen Anwendung erforderlich.',
            variant: 'body',
            align: 'left',
            fontSize: 11,
            fontFamily: '"PT Sans", sans-serif',
            color: cGray,
            fontWeight: 'normal',
            fontStyle: 'normal',
            backgroundColor: 'transparent'
          },
          {
            id: uuid(),
            type: 'text',
            name: 'Footer Label',
            xMm: 0,
            yMm: 180,
            widthMm: 60,
            heightMm: 10,
            rotationDeg: 0,
            locked: false,
            text: 'Ansprechpartner',
            variant: 'body',
            align: 'left',
            fontSize: 10,
            fontFamily: '"PT Sans", sans-serif',
            color: cDark,
            fontWeight: 'normal',
            fontStyle: 'normal',
            backgroundColor: 'transparent'
          },
          {
            id: uuid(),
            type: 'text',
            name: 'Footer Name',
            xMm: 0,
            yMm: 188,
            widthMm: 70,
            heightMm: 8,
            rotationDeg: 0,
            locked: false,
            text: ' Christian Noss',
            variant: 'body',
            align: 'left',
            fontSize: 12,
            fontFamily: '"PT Sans", sans-serif',
            color: 'white',
            fontWeight: 'bold',
            fontStyle: 'normal',
            backgroundColor: cDark
          }
        ]
      }
    ]
  },
  {
    id: 't_a4_bachelor',
    name: 'Poster: Studiengang Info',
    format: 'A4',
    allowedZones: [],
    pages: [
      {
        elements: [
          {
            id: uuid(),
            type: 'image',
            name: 'Header',
            xMm: 0,
            yMm: 0,
            widthMm: 210,
            heightMm: 60,
            rotationDeg: 0,
            locked: false,
            assetId: '',
            fit: 'cover',
            src: 'https://placehold.co/800x250/efefef/999?text=Studenten+Header'
          },
          {
            id: uuid(),
            type: 'text',
            name: 'Headline',
            xMm: 20,
            yMm: 70,
            widthMm: 170,
            heightMm: 20,
            rotationDeg: 0,
            locked: false,
            text: 'Medieninformatik\nBachelor',
            variant: 'title',
            align: 'left',
            fontSize: 36,
            fontFamily: '"Roboto Slab", serif',
            color: cDark,
            fontWeight: 'bold',
            fontStyle: 'normal',
            backgroundColor: 'transparent'
          },
          {
            id: uuid(),
            type: 'text',
            name: 'Intro Text',
            xMm: 20,
            yMm: 100,
            widthMm: 170,
            heightMm: 100,
            rotationDeg: 0,
            locked: false,
            text:
              'Die Menschen mit ihren Beduerfnissen stehen im Zentrum der Medieninformatik. Absolvent*innen unserer Medieninformatik-Studiengaenge konzipieren und explorieren neue digitale Medien und interaktive digitale Produkte.\n\nSie sind in der Lage, ihr Wissen in anwendungsorientierten Projekten umzusetzen, wissenschaftlich fundierte Urteile abzuleiten und Loesungsansaetze zu entwickeln.',
            variant: 'body',
            align: 'left',
            fontSize: 14,
            fontFamily: '"PT Sans", sans-serif',
            color: cGray,
            fontWeight: 'normal',
            fontStyle: 'normal',
            backgroundColor: 'transparent'
          },
          {
            id: uuid(),
            type: 'text',
            name: 'TH Logo Text',
            xMm: 140,
            yMm: 260,
            widthMm: 50,
            heightMm: 20,
            rotationDeg: 0,
            locked: false,
            text: 'Technology\nArts Sciences\nTH Koeln',
            variant: 'body',
            align: 'right',
            fontSize: 12,
            fontFamily: '"PT Sans", sans-serif',
            color: cRed,
            fontWeight: 'bold',
            fontStyle: 'normal',
            backgroundColor: 'transparent'
          }
        ]
      }
    ]
  },
  {
    id: 't_a4_moxd',
    name: 'Poster: Lab (moxd)',
    format: 'A4',
    allowedZones: [],
    pages: [
      {
        elements: [
          {
            id: uuid(),
            type: 'image',
            name: 'Network Graphic',
            xMm: 0,
            yMm: 0,
            widthMm: 210,
            heightMm: 100,
            rotationDeg: 0,
            locked: false,
            assetId: '',
            fit: 'cover',
            src: 'https://placehold.co/800x400/5952e1/fff?text=Network+Graphic'
          },
          {
            id: uuid(),
            type: 'text',
            name: 'Lab Title',
            xMm: 20,
            yMm: 110,
            widthMm: 170,
            heightMm: 20,
            rotationDeg: 0,
            locked: false,
            text: 'moxd lab',
            variant: 'title',
            align: 'left',
            fontSize: 32,
            fontFamily: '"Roboto Slab", serif',
            color: cDark,
            fontWeight: 'bold',
            fontStyle: 'normal',
            backgroundColor: 'transparent'
          },
          {
            id: uuid(),
            type: 'text',
            name: 'Subtitle',
            xMm: 20,
            yMm: 125,
            widthMm: 170,
            heightMm: 20,
            rotationDeg: 0,
            locked: false,
            text: 'Lab for Mobile and Distributed\nInformation Technology',
            variant: 'subtitle',
            align: 'left',
            fontSize: 24,
            fontFamily: '"PT Sans", sans-serif',
            color: cGray,
            fontWeight: 'normal',
            fontStyle: 'normal',
            backgroundColor: 'transparent'
          },
          {
            id: uuid(),
            type: 'text',
            name: 'Bullet Points',
            xMm: 20,
            yMm: 150,
            widthMm: 170,
            heightMm: 50,
            rotationDeg: 0,
            locked: false,
            text:
              '- Teaching, building and studying distributed IT\n- Methods and concepts for developing distributed systems\n- Solving problems by making creative use of IT',
            variant: 'body',
            align: 'left',
            fontSize: 16,
            fontFamily: '"PT Sans", sans-serif',
            color: cGray,
            fontWeight: 'normal',
            fontStyle: 'normal',
            backgroundColor: 'transparent'
          }
        ]
      }
    ]
  }
]

function getPreviewClass(format: string) {
  if (format.toLowerCase().includes('landscape')) return 'is-landscape'
  if (format === 'Flyer') return 'is-flyer'
  return ''
}

function selectTemplate(template: Template) {
  editorStore.createPosterFromTemplate(template)
  if (editorStore.activePoster) {
    router.push(`/editor/${editorStore.activePoster.id}`)
  }
}
</script>

<template>
  <AppFrame>
    <SectionHeader
      title="Neue Poster-Vorlage waehlen"
      subtitle="Waehlen Sie eine Vorlage im TH-Koeln Design."
    />

    <div class="row g-4">
      <div v-for="t in mockTemplates" :key="t.id" class="col-12 col-sm-6 col-lg-4 col-xl-3">
        <SectionCard clickable class="template-card" @click="selectTemplate(t)">
          <div class="template-preview" :class="getPreviewClass(t.format)">
            <div class="template-hover">
              <button class="btn btn-light btn-sm">Verwenden</button>
            </div>

            <div class="template-preview-canvas d-flex flex-column">
              <div v-if="t.id === 't_a4_empty'" class="preview-empty">Leer</div>

              <template v-if="t.id === 't_flyer_ar'">
                <div class="preview-strip-1 w-100 mb-2"></div>
                <div class="px-2">
                  <div class="preview-line preview-accent w-50"></div>
                  <div class="preview-line preview-bold w-100 mb-2"></div>
                  <div class="preview-line w-100"></div>
                  <div class="preview-line w-100"></div>
                </div>
              </template>

              <template v-if="t.id === 't_a4_bachelor'">
                <div class="preview-strip-2 w-100 mb-3"></div>
                <div class="px-3">
                  <div class="preview-line preview-bold w-75 mb-3"></div>
                  <div class="preview-line w-100"></div>
                  <div class="preview-line w-100"></div>
                  <div class="preview-line w-75"></div>
                </div>
              </template>

              <template v-if="t.id === 't_a4_moxd'">
                <div class="preview-banner w-100 mb-3"></div>
                <div class="px-3">
                  <div class="preview-line preview-bold w-50 mb-2"></div>
                  <div class="preview-line w-75 mb-3"></div>
                  <div class="preview-line w-100"></div>
                  <div class="preview-line w-100"></div>
                </div>
              </template>
            </div>
          </div>

          <div class="card-body">
            <h3 class="h6 mb-1">{{ t.name }}</h3>
            <span class="text-secondary small text-uppercase">{{ t.format }}</span>
          </div>
        </SectionCard>
      </div>
    </div>
  </AppFrame>
</template>

<style scoped>
.template-preview {
  position: relative;
  overflow: hidden;
  border-bottom: 1px solid #dfe3e8;
  background: #ffffff;
  aspect-ratio: 1 / 1.414;
}

.template-preview.is-flyer {
  aspect-ratio: 1 / 2.1;
}

.template-preview.is-landscape {
  aspect-ratio: 1.414 / 1;
}

.template-hover {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(15, 23, 42, 0.08);
  opacity: 0;
  transition: opacity 0.2s ease;
  z-index: 2;
}

.template-card:hover .template-hover {
  opacity: 1;
}

.template-preview-canvas {
  width: 100%;
  height: 100%;
  pointer-events: none;
}

.preview-empty {
  height: calc(100% - 2rem);
  margin: 1rem;
  border: 2px dashed #d4d8de;
  border-radius: 0.35rem;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #9ea6ae;
}

.preview-strip-1,
.preview-strip-2,
.preview-line,
.preview-banner {
  background: #ced4da;
}

.preview-strip-1 {
  height: 34%;
}

.preview-strip-2 {
  height: 25%;
}

.preview-line {
  height: 0.3rem;
  margin-bottom: 0.35rem;
}

.preview-line.preview-bold {
  height: 0.55rem;
  background: #344054;
}

.preview-line.preview-accent {
  background: #dd1166;
}

.preview-banner {
  height: 35%;
  background: #e6e9f2;
  position: relative;
}

.preview-banner::after {
  content: "";
  position: absolute;
  left: 0;
  right: 0;
  bottom: 0;
  border-bottom: 3px solid #f97316;
  opacity: 0.6;
}
</style>
