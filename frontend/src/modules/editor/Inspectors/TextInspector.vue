<template>
  <div class="space-y-4">
    <div class="space-y-1">
      <label class="text-xs font-semibold text-gray-500 uppercase">Inhalt</label>
      <textarea 
        v-model="localText" 
        rows="3"
        class="w-full text-sm p-2 border border-gray-200 rounded focus:border-red-500 focus:outline-none"
        @input="update"
      ></textarea>
    </div>

    <div class="space-y-1">
      <label class="text-xs font-semibold text-gray-500 uppercase">Schriftart</label>
      <select 
        v-model="localFontFamily" 
        class="w-full text-sm p-2 border border-gray-200 rounded"
        @change="update"
      >
        <option :value="typography.fontFamily.headings">Roboto Slab (Überschriften)</option>
        <option :value="typography.fontFamily.body">PT Sans (Fließtext)</option>
      </select>
    </div>

    <div class="space-y-1">
      <label class="text-xs font-semibold text-gray-500 uppercase">Größe (Vorgeschlagen)</label>
      <select 
        v-model.number="localFontSize" 
        class="w-full text-sm p-2 border border-gray-200 rounded"
        @change="update"
      >
        <option :value="typography.sizes.presentationTitle">Präsentationstitel ({{ typography.sizes.presentationTitle }}pt)</option>
        <option :value="typography.sizes.slideTitle">Folientitel ({{ typography.sizes.slideTitle }}pt)</option>
        <option :value="typography.sizes.headline">Überschrift ({{ typography.sizes.headline }}pt)</option>
        <option :value="typography.sizes.body">Fließtext ({{ typography.sizes.body }}pt)</option>
        <option :value="typography.sizes.caption">Bildunterschrift ({{ typography.sizes.caption }}pt)</option>
        <option :value="localFontSize" v-if="!isStandardSize">Benutzerdefiniert ({{ localFontSize }}pt)</option>
      </select>
    </div>

    <div class="space-y-1">
      <label class="text-xs font-semibold text-gray-500 uppercase">Stil & Ausrichtung</label>
      <div class="flex gap-2 mb-2">

        <button 
          @click="toggleBold"
          :class="['px-3 border rounded flex items-center justify-center', localFontWeight === 'bold' ? 'bg-gray-200 border-gray-400' : 'bg-white border-gray-200']"
          title="Fett"
        >
          <Bold :size="16" />
        </button>
        <button 
          @click="toggleItalic"
          :class="['px-3 border rounded flex items-center justify-center', localFontStyle === 'italic' ? 'bg-gray-200 border-gray-400' : 'bg-white border-gray-200']"
          title="Kursiv"
        >
          <Italic :size="16" />
        </button>
      </div>
    </div>

    <!-- Custom Size (Hidden or secondary) -->
    <div class="space-y-1 mt-2" v-if="false">
      <label class="text-xs font-semibold text-gray-500 uppercase">Benutzerdefinierte Größe</label>
      <input type="number" v-model.number="localFontSize" @input="update" class="w-full text-sm p-2 border border-gray-200 rounded" />
    </div>

    <div class="space-y-1 w-full">
        <label class="text-xs font-semibold text-gray-500 uppercase">Text Ausrichtung</label>
        <div class="flex border border-gray-200 rounded overflow-hidden">
          <button 
            @click="setAlign('left')"
            :class="['flex-1 py-1 flex items-center justify-center hover:bg-gray-50', localAlign === 'left' ? 'bg-gray-100 text-red-600' : 'text-gray-600']"
            title="Links"
          >
            <AlignLeft :size="16" />
          </button>
          <button 
            @click="setAlign('center')"
            :class="['flex-1 py-1 flex items-center justify-center hover:bg-gray-50', localAlign === 'center' ? 'bg-gray-100 text-red-600' : 'text-gray-600']"
            title="Zentriert"
          >
            <AlignCenter :size="16" />
          </button>
           <button 
            @click="setAlign('right')"
            :class="['flex-1 py-1 flex items-center justify-center hover:bg-gray-50', localAlign === 'right' ? 'bg-gray-100 text-red-600' : 'text-gray-600']"
            title="Rechts"
          >
            <AlignRight :size="16" />
          </button>
        </div>
    </div>

    <div class="space-y-1">
      <label class="text-xs font-semibold text-gray-500 uppercase">Schriftfarbe</label>
      <div class="flex flex-wrap gap-2">
        <button 
          v-for="color in availableColors" 
          :key="color.value" 
          @click="setColor(color.value)"
          class="w-8 h-8 rounded-full border border-gray-200 shadow-sm focus:ring-2 ring-offset-1 ring-red-500"
          :style="{ backgroundColor: color.value }"
          :title="color.name"
        ></button>
         <input type="color" v-model="localColor" @input="update" class="w-8 h-8 p-0 border-0 rounded-full overflow-hidden" />
      </div>
    </div>

    <div class="space-y-1">
      <label class="text-xs font-semibold text-gray-500 uppercase">Hintergrund</label>
      <div class="flex flex-wrap gap-2">
         <!-- Transparent / None Option -->
         <button 
          @click="localBackgroundColor = 'transparent'; update()"
          class="w-8 h-8 rounded-full border border-gray-200 shadow-sm flex items-center justify-center bg-white hover:bg-gray-50 focus:ring-2 ring-offset-1 ring-red-500 overflow-hidden"
          title="Kein Hintergrund"
        >
          <div class="w-full h-px bg-red-500 transform rotate-45"></div>
        </button>

        <button 
          v-for="color in availableColors" 
          :key="color.value + '_bg'" 
          @click="localBackgroundColor = color.value; update()"
          class="w-8 h-8 rounded-full border border-gray-200 shadow-sm focus:ring-2 ring-offset-1 ring-red-500"
          :style="{ backgroundColor: color.value }"
          :title="color.name"
        ></button>
         <input type="color" v-model="localBackgroundColor" @input="update" class="w-8 h-8 p-0 border-0 rounded-full overflow-hidden" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, computed } from 'vue';
import type { TextElement } from '@/core/models/element';
import { useEditorStore } from '@/core/store/useEditorStore';
import { typography } from '@/core/styleguide/typography';
import { colors } from '@/core/styleguide/colors';
import { Bold, Italic, AlignLeft, AlignCenter, AlignRight } from 'lucide-vue-next';

const props = defineProps<{
  element: TextElement;
}>();

const store = useEditorStore();

// Local state for smooth editing
const localText = ref(props.element.text);
const localVariant = ref(props.element.variant);
const localFontSize = ref(props.element.fontSize);
const localFontFamily = ref(props.element.fontFamily || typography.fontFamily.body);
const localAlign = ref(props.element.align);
const localColor = ref(props.element.color);
const localFontWeight = ref(props.element.fontWeight || 'normal');
const localFontStyle = ref(props.element.fontStyle || 'normal');
const localBackgroundColor = ref(props.element.backgroundColor || 'transparent');

const availableColors = [
  { name: 'TH Red', value: colors.palette.thRed },
  { name: 'Purple', value: colors.palette.purple },
  { name: 'Blue', value: colors.palette.blue },
  { name: 'Green', value: colors.palette.green },
  { name: 'Dark Gray', value: colors.palette.darkGray },
  { name: 'Medium Gray', value: colors.palette.mediumGray },
  { name: 'Light Gray', value: colors.palette.lightGray },
  { name: 'White', value: colors.palette.white },
];

// Watch props incase selection changes
watch(() => props.element, (newVal) => {
  localText.value = newVal.text;
  localVariant.value = newVal.variant;
  localFontSize.value = newVal.fontSize;
  localFontFamily.value = newVal.fontFamily || typography.fontFamily.body;
  localAlign.value = newVal.align;
  localColor.value = newVal.color || '#000000';
  localFontWeight.value = newVal.fontWeight || 'normal';
  localFontStyle.value = newVal.fontStyle || 'normal';
  localBackgroundColor.value = newVal.backgroundColor || 'transparent';
}, { deep: true });

const isStandardSize = computed(() => {
  return Object.values(typography.sizes).includes(localFontSize.value as any);
});

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
  });
}

// Unused but keeping for reference if needed
// function applyVariant() { ... }
// function toggleBg(e: Event) { ... }

function setAlign(align: 'left' | 'center' | 'right') {
  localAlign.value = align;
  update();
}

function setColor(color: string) {
  localColor.value = color;
  update();
}

function toggleBold() {
  localFontWeight.value = localFontWeight.value === 'bold' ? 'normal' : 'bold';
  update();
}

function toggleItalic() {
  localFontStyle.value = localFontStyle.value === 'italic' ? 'normal' : 'italic';
  update();
}
</script>
