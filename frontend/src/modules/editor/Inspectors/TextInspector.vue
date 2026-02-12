<template>
  <div class="vstack gap-3">
    <div>
      <label class="inspector-label d-inline-flex align-items-center gap-1">
        Inhalt
        <Lock v-if="!canEditTextContent" :size="12" />
      </label>
      <textarea
        v-model="localText"
        rows="3"
        class="form-control form-control-sm"
        :disabled="!canEditTextContent"
        @input="update"
      ></textarea>
    </div>

    <p v-if="hasLockedControls" class="small text-secondary mb-0 d-inline-flex align-items-center gap-1">
      <Lock :size="12" />
      Einige Eigenschaften sind fuer deine Rolle gesperrt.
    </p>

    <div>
      <label class="inspector-label d-inline-flex align-items-center gap-1">
        Schriftart
        <Lock v-if="!canEditTypography" :size="12" />
      </label>
      <select v-model="localFontFamily" class="form-select form-select-sm" :disabled="!canEditTypography" @change="update">
        <option :value="typography.fontFamily.body">PT Sans</option>
      </select>
    </div>

    <div>
      <label class="inspector-label d-inline-flex align-items-center gap-1">
        Groesse
        <Lock v-if="!canEditTypography" :size="12" />
      </label>
      <select v-model.number="localFontSize" class="form-select form-select-sm" :disabled="!canEditTypography" @change="onPresetSizeChange">
        <option :value="typography.sizes.presentationTitle">
          Praesentationstitel ({{ typography.sizes.presentationTitle }}pt)
        </option>
        <option :value="typography.sizes.slideTitle">Folientitel ({{ typography.sizes.slideTitle }}pt)</option>
        <option :value="typography.sizes.headline">Ueberschrift ({{ typography.sizes.headline }}pt)</option>
        <option :value="typography.sizes.body">Fliesstext ({{ typography.sizes.body }}pt)</option>
        <option :value="typography.sizes.caption">Bildunterschrift ({{ typography.sizes.caption }}pt)</option>
        <option v-if="!isStandardSize" :value="localFontSize">Benutzerdefiniert ({{ localFontSize }}pt)</option>
      </select>

      <div class="input-group input-group-sm mt-2">
        <span class="input-group-text">Eigene pt</span>
        <input
          v-model.number="customFontSizeInput"
          type="number"
          class="form-control"
          :min="MIN_FONT_SIZE"
          :max="MAX_FONT_SIZE"
          :disabled="!canEditTypography"
          @blur="applyCustomFontSize"
          @keydown.enter.prevent="applyCustomFontSize"
        />
        <button type="button" class="btn btn-outline-secondary" :disabled="!canEditTypography" @click="applyCustomFontSize">
          Anwenden
        </button>
      </div>
      <p class="small text-secondary mt-1 mb-0">Eigene Werte ueberschreiben die vorgeschlagenen Groessen.</p>
    </div>

    <div>
      <label class="inspector-label d-inline-flex align-items-center gap-1">
        Stil
        <Lock v-if="!canEditTypography" :size="12" />
      </label>
      <div class="d-flex gap-2">
        <button
          type="button"
          class="btn btn-sm"
          :class="localFontWeight === 'bold' ? 'btn-secondary' : 'btn-outline-secondary'"
          title="Fett"
          :disabled="!canEditTypography"
          @click="toggleBold"
        >
          <Bold :size="16" />
        </button>
        <button
          type="button"
          class="btn btn-sm"
          :class="localFontStyle === 'italic' ? 'btn-secondary' : 'btn-outline-secondary'"
          title="Kursiv"
          :disabled="!canEditTypography"
          @click="toggleItalic"
        >
          <Italic :size="16" />
        </button>
      </div>
    </div>

    <div>
      <label class="inspector-label d-inline-flex align-items-center gap-1">
        Text Ausrichtung
        <Lock v-if="!canEditTypography" :size="12" />
      </label>
      <div class="btn-group w-100">
        <button
          type="button"
          class="btn btn-sm"
          :class="localAlign === 'left' ? 'btn-secondary' : 'btn-outline-secondary'"
          title="Links"
          :disabled="!canEditTypography"
          @click="setAlign('left')"
        >
          <AlignLeft :size="16" />
        </button>
        <button
          type="button"
          class="btn btn-sm"
          :class="localAlign === 'center' ? 'btn-secondary' : 'btn-outline-secondary'"
          title="Zentriert"
          :disabled="!canEditTypography"
          @click="setAlign('center')"
        >
          <AlignCenter :size="16" />
        </button>
        <button
          type="button"
          class="btn btn-sm"
          :class="localAlign === 'right' ? 'btn-secondary' : 'btn-outline-secondary'"
          title="Rechts"
          :disabled="!canEditTypography"
          @click="setAlign('right')"
        >
          <AlignRight :size="16" />
        </button>
      </div>
    </div>

    <div>
      <label class="inspector-label d-inline-flex align-items-center gap-1">
        Schriftfarbe
        <Lock v-if="!canEditColors" :size="12" />
      </label>
      <div class="d-flex flex-wrap gap-2 align-items-center">
        <button
          v-for="color in availableColors"
          :key="color.value"
          type="button"
          class="color-swatch"
          :class="{ 'is-active': localColor === color.value }"
          :style="{ backgroundColor: color.value }"
          :title="color.name"
          :disabled="!canEditColors"
          @click="setColor(color.value)"
        ></button>
        <input type="color" v-model="localColor" class="color-swatch" :disabled="!canEditColors" @input="update" />
      </div>
    </div>

    <div>
      <label class="inspector-label d-inline-flex align-items-center gap-1">
        Hintergrund
        <Lock v-if="!canEditColors" :size="12" />
      </label>
      <div class="d-flex flex-wrap gap-2 align-items-center">
        <button
          type="button"
          class="color-swatch transparent"
          :class="{ 'is-active': localBackgroundColor === 'transparent' }"
          title="Kein Hintergrund"
          :disabled="!canEditColors"
          @click="localBackgroundColor = 'transparent'; update()"
        ></button>

        <button
          v-for="color in availableColors"
          :key="`${color.value}_bg`"
          type="button"
          class="color-swatch"
          :class="{ 'is-active': localBackgroundColor === color.value }"
          :style="{ backgroundColor: color.value }"
          :title="color.name"
          :disabled="!canEditColors"
          @click="localBackgroundColor = color.value; update()"
        ></button>

        <input type="color" v-model="localBackgroundColor" class="color-swatch" :disabled="!canEditColors" @input="update" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, computed } from 'vue'
import type { TextElement } from '@/core/models/element'
import { useEditorStore } from '@/core/store/useEditorStore'
import { useAuthStore } from '@/core/store/useAuthStore'
import { useProjectAccessStore } from '@/core/store/useProjectAccessStore'
import type { ProjectRole } from '@/core/models/accessControl'
import { typography } from '@/core/styleguide/typography'
import { colors } from '@/core/styleguide/colors'
import { Bold, Italic, AlignLeft, AlignCenter, AlignRight, Lock } from 'lucide-vue-next'

const props = defineProps<{
  element: TextElement
}>()

const store = useEditorStore()
const authStore = useAuthStore()
const accessStore = useProjectAccessStore()
const MIN_FONT_SIZE = 8
const MAX_FONT_SIZE = 320

const localText = ref(props.element.text)
const localFontSize = ref(props.element.fontSize)
const customFontSizeInput = ref(props.element.fontSize)
const localFontFamily = ref(props.element.fontFamily || typography.fontFamily.body)
const localAlign = ref(props.element.align)
const localColor = ref(props.element.color)
const localFontWeight = ref(props.element.fontWeight || 'normal')
const localFontStyle = ref(props.element.fontStyle || 'normal')
const localBackgroundColor = ref(props.element.backgroundColor || 'transparent')

const availableColors = [
  { name: 'TH Red', value: colors.palette.thRed },
  { name: 'Purple', value: colors.palette.purple },
  { name: 'Blue', value: colors.palette.blue },
  { name: 'Green', value: colors.palette.green },
  { name: 'Dark Gray', value: colors.palette.darkGray },
  { name: 'Medium Gray', value: colors.palette.mediumGray },
  { name: 'Light Gray', value: colors.palette.lightGray },
  { name: 'White', value: colors.palette.white }
]

const activeProjectId = computed(() => store.activePoster?.id || '')
const currentProjectRole = computed<ProjectRole>(() => {
  if (authStore.isLinkSession) return authStore.linkSession?.role || 'viewer'
  const resolved = accessStore.resolveProjectRole(activeProjectId.value, authStore.user?.id, authStore.user?.email)
  return resolved || 'owner'
})

const canEditTextContent = computed(() => {
  if (!activeProjectId.value) return true
  return accessStore.canRolePerform(activeProjectId.value, currentProjectRole.value, 'editTextContent')
})

const canEditTypography = computed(() => {
  if (!activeProjectId.value) return true
  return accessStore.canRolePerform(activeProjectId.value, currentProjectRole.value, 'editTypography')
})

const canEditColors = computed(() => {
  if (!activeProjectId.value) return true
  return accessStore.canRolePerform(activeProjectId.value, currentProjectRole.value, 'editColors')
})

const hasLockedControls = computed(() => !canEditTextContent.value || !canEditTypography.value || !canEditColors.value)

watch(
  () => props.element,
  (newVal) => {
    localText.value = newVal.text
    localFontSize.value = newVal.fontSize
    customFontSizeInput.value = newVal.fontSize
    localFontFamily.value = newVal.fontFamily || typography.fontFamily.body
    localAlign.value = newVal.align
    localColor.value = newVal.color || '#000000'
    localFontWeight.value = newVal.fontWeight || 'normal'
    localFontStyle.value = newVal.fontStyle || 'normal'
    localBackgroundColor.value = newVal.backgroundColor || 'transparent'
  },
  { deep: true }
)

const isStandardSize = computed(() => {
  return Object.values(typography.sizes).includes(localFontSize.value as any)
})

function update() {
  const partial: Partial<TextElement> = {}
  if (canEditTextContent.value) {
    partial.text = localText.value
  }
  if (canEditTypography.value) {
    partial.fontSize = localFontSize.value
    partial.fontFamily = localFontFamily.value
    partial.align = localAlign.value
    partial.fontWeight = localFontWeight.value
    partial.fontStyle = localFontStyle.value
  }
  if (canEditColors.value) {
    partial.color = localColor.value
    partial.backgroundColor = localBackgroundColor.value
  }
  if (Object.keys(partial).length === 0) return
  store.updateElement(props.element.id, partial)
}

function normalizeFontSize(value: number) {
  if (!Number.isFinite(value)) return MIN_FONT_SIZE
  return Math.min(MAX_FONT_SIZE, Math.max(MIN_FONT_SIZE, Math.round(value)))
}

function onPresetSizeChange() {
  if (!canEditTypography.value) return
  localFontSize.value = normalizeFontSize(localFontSize.value)
  customFontSizeInput.value = localFontSize.value
  update()
}

function applyCustomFontSize() {
  if (!canEditTypography.value) return
  const normalized = normalizeFontSize(customFontSizeInput.value)
  customFontSizeInput.value = normalized
  localFontSize.value = normalized
  update()
}

function setAlign(align: 'left' | 'center' | 'right') {
  if (!canEditTypography.value) return
  localAlign.value = align
  update()
}

function setColor(color: string) {
  if (!canEditColors.value) return
  localColor.value = color
  update()
}

function toggleBold() {
  if (!canEditTypography.value) return
  localFontWeight.value = localFontWeight.value === 'bold' ? 'normal' : 'bold'
  update()
}

function toggleItalic() {
  if (!canEditTypography.value) return
  localFontStyle.value = localFontStyle.value === 'italic' ? 'normal' : 'italic'
  update()
}
</script>
