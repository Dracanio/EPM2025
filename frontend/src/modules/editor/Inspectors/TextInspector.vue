<template>
  <div class="vstack gap-3">
    <div>
      <label class="inspector-label">Inhalt</label>
      <textarea
        v-model="localText"
        rows="3"
        class="form-control form-control-sm"
        @input="update"
      ></textarea>
    </div>

    <div>
      <label class="inspector-label">Schriftart</label>
      <select v-model="localFontFamily" class="form-select form-select-sm" @change="update">
        <option :value="typography.fontFamily.body">PT Sans</option>
      </select>
    </div>

    <div>
      <label class="inspector-label">Groesse (Vorgeschlagen)</label>
      <select v-model.number="localFontSize" class="form-select form-select-sm" @change="update">
        <option :value="typography.sizes.presentationTitle">
          Praesentationstitel ({{ typography.sizes.presentationTitle }}pt)
        </option>
        <option :value="typography.sizes.slideTitle">Folientitel ({{ typography.sizes.slideTitle }}pt)</option>
        <option :value="typography.sizes.headline">Ueberschrift ({{ typography.sizes.headline }}pt)</option>
        <option :value="typography.sizes.body">Fliesstext ({{ typography.sizes.body }}pt)</option>
        <option :value="typography.sizes.caption">Bildunterschrift ({{ typography.sizes.caption }}pt)</option>
        <option v-if="!isStandardSize" :value="localFontSize">Benutzerdefiniert ({{ localFontSize }}pt)</option>
      </select>
    </div>

    <div>
      <label class="inspector-label">Stil</label>
      <div class="d-flex gap-2">
        <button
          type="button"
          class="btn btn-sm"
          :class="localFontWeight === 'bold' ? 'btn-secondary' : 'btn-outline-secondary'"
          title="Fett"
          @click="toggleBold"
        >
          <Bold :size="16" />
        </button>
        <button
          type="button"
          class="btn btn-sm"
          :class="localFontStyle === 'italic' ? 'btn-secondary' : 'btn-outline-secondary'"
          title="Kursiv"
          @click="toggleItalic"
        >
          <Italic :size="16" />
        </button>
      </div>
    </div>

    <div>
      <label class="inspector-label">Text Ausrichtung</label>
      <div class="btn-group w-100">
        <button
          type="button"
          class="btn btn-sm"
          :class="localAlign === 'left' ? 'btn-secondary' : 'btn-outline-secondary'"
          title="Links"
          @click="setAlign('left')"
        >
          <AlignLeft :size="16" />
        </button>
        <button
          type="button"
          class="btn btn-sm"
          :class="localAlign === 'center' ? 'btn-secondary' : 'btn-outline-secondary'"
          title="Zentriert"
          @click="setAlign('center')"
        >
          <AlignCenter :size="16" />
        </button>
        <button
          type="button"
          class="btn btn-sm"
          :class="localAlign === 'right' ? 'btn-secondary' : 'btn-outline-secondary'"
          title="Rechts"
          @click="setAlign('right')"
        >
          <AlignRight :size="16" />
        </button>
      </div>
    </div>

    <div>
      <label class="inspector-label">Schriftfarbe</label>
      <div class="d-flex flex-wrap gap-2 align-items-center">
        <button
          v-for="color in availableColors"
          :key="color.value"
          type="button"
          class="color-swatch"
          :class="{ 'is-active': localColor === color.value }"
          :style="{ backgroundColor: color.value }"
          :title="color.name"
          @click="setColor(color.value)"
        ></button>
        <input type="color" v-model="localColor" class="color-swatch" @input="update" />
      </div>
    </div>

    <div>
      <label class="inspector-label">Hintergrund</label>
      <div class="d-flex flex-wrap gap-2 align-items-center">
        <button
          type="button"
          class="color-swatch transparent"
          :class="{ 'is-active': localBackgroundColor === 'transparent' }"
          title="Kein Hintergrund"
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
          @click="localBackgroundColor = color.value; update()"
        ></button>

        <input type="color" v-model="localBackgroundColor" class="color-swatch" @input="update" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, computed } from 'vue'
import type { TextElement } from '@/core/models/element'
import { useEditorStore } from '@/core/store/useEditorStore'
import { typography } from '@/core/styleguide/typography'
import { colors } from '@/core/styleguide/colors'
import { Bold, Italic, AlignLeft, AlignCenter, AlignRight } from 'lucide-vue-next'

const props = defineProps<{
  element: TextElement
}>()

const store = useEditorStore()

const localText = ref(props.element.text)
const localVariant = ref(props.element.variant)
const localFontSize = ref(props.element.fontSize)
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

watch(
  () => props.element,
  (newVal) => {
    localText.value = newVal.text
    localVariant.value = newVal.variant
    localFontSize.value = newVal.fontSize
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
  store.updateElement(props.element.id, {
    text: localText.value,
    fontSize: localFontSize.value,
    fontFamily: localFontFamily.value,
    align: localAlign.value,
    color: localColor.value,
    fontWeight: localFontWeight.value,
    fontStyle: localFontStyle.value,
    backgroundColor: localBackgroundColor.value
  })
}

function setAlign(align: 'left' | 'center' | 'right') {
  localAlign.value = align
  update()
}

function setColor(color: string) {
  localColor.value = color
  update()
}

function toggleBold() {
  localFontWeight.value = localFontWeight.value === 'bold' ? 'normal' : 'bold'
  update()
}

function toggleItalic() {
  localFontStyle.value = localFontStyle.value === 'italic' ? 'normal' : 'italic'
  update()
}
</script>
