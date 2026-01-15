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
      <label class="text-xs font-semibold text-gray-500 uppercase">Stil</label>
      <div class="flex gap-2">
         <select 
          v-model="localVariant" 
          class="w-full text-sm p-2 border border-gray-200 rounded"
          @change="applyVariant"
        >
          <option value="title">Titel</option>
          <option value="subtitle">Untertitel</option>
          <option value="body">Fließtext</option>
        </select>
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

    <div class="grid grid-cols-2 gap-2">
      <div class="space-y-1">
        <label class="text-xs font-semibold text-gray-500 uppercase">Größe (pt/px)</label>
        <input 
          type="number" 
          v-model.number="localFontSize" 
          class="w-full text-sm p-2 border border-gray-200 rounded"
          @input="update"
        />
      </div>
      <div class="space-y-1">
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
import { textVariants } from '@/core/styleguide/typography';
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
const localAlign = ref(props.element.align);
const localColor = ref(props.element.color);
const localFontWeight = ref(props.element.fontWeight || 'normal');
const localFontStyle = ref(props.element.fontStyle || 'normal');
const localBackgroundColor = ref(props.element.backgroundColor || 'transparent');

const availableColors = [
  { name: 'Red', value: colors.primary.DEFAULT },
  { name: 'Dark Red', value: colors.primary.dark },
  { name: 'Black', value: colors.basic.black },
  { name: 'Dark Gray', value: colors.gray[900] },
  { name: 'Gray', value: colors.gray[500] },
  { name: 'White', value: colors.basic.white },
];

// Watch props incase selection changes
watch(() => props.element, (newVal) => {
  localText.value = newVal.text;
  localVariant.value = newVal.variant;
  localFontSize.value = newVal.fontSize;
  localAlign.value = newVal.align;
  localColor.value = newVal.color || '#000000';
  localFontWeight.value = newVal.fontWeight || 'normal';
  localFontStyle.value = newVal.fontStyle || 'normal';
  localBackgroundColor.value = newVal.backgroundColor || 'transparent';
}, { deep: true });

function update() {
  store.updateElement(props.element.id, {
    text: localText.value,
    fontSize: localFontSize.value,
    align: localAlign.value,
    color: localColor.value,
    fontWeight: localFontWeight.value,
    fontStyle: localFontStyle.value,
    backgroundColor: localBackgroundColor.value
  });
}

function applyVariant() {
  const variant = localVariant.value;
  const style = textVariants[variant];
  store.updateElement(props.element.id, {
    variant: variant,
    fontSize: style.fontSize,
    fontFamily: style.fontFamily,
    // Keep existing color or reset? Let's keep existing.
  });
  // Update local state to match
  localFontSize.value = style.fontSize;
}

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

function toggleBg(e: Event) {
    const checked = (e.target as HTMLInputElement).checked;
    if (checked) {
        localBackgroundColor.value = '#ffffff'; // Default to white
    } else {
        localBackgroundColor.value = 'transparent';
    }
    update();
}
</script>
