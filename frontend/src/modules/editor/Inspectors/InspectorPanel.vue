<template>
  <div class="h-full flex flex-col">
    <div class="p-4 border-b border-gray-100 bg-gray-50 flex items-center justify-between">
      <h2 class="text-xs font-bold text-gray-500 uppercase tracking-wider">
        {{ title }}
      </h2>
      <button 
        v-if="selectedElement" 
        @click="store.selectElement(null)"
        class="text-xs text-gray-400 hover:text-gray-600 flex items-center gap-1"
      >
        <X :size="14" />
        Close
      </button>
    </div>

    <div class="flex-1 overflow-y-auto p-4">
      <TextInspector 
        v-if="selectedElement?.type === 'text'" 
        :element="selectedElement as TextElement" 
      />
      <ImageInspector 
        v-if="selectedElement?.type === 'image'" 
        :element="selectedElement as ImageElement" 
      />
      
      <div v-if="!selectedElement" class="space-y-6">
        <div class="text-center text-gray-400 text-sm italic py-4 flex flex-col items-center gap-2">
          <MousePointerClick :size="32" class="opacity-20" />
          <span>Kein Element ausgewählt.<br>Klicke auf ein Element auf dem Poster.</span>
        </div>
        
        <!-- Poster Properties -->
        <div class="space-y-2 px-4">
           <label class="text-xs font-semibold text-gray-500 uppercase">Poster Hintergrund</label>
           <div class="flex flex-wrap gap-2">
             <button 
                v-for="color in availableColors" 
                :key="color.value" 
                @click="setPosterBackground(color.value)"
                class="w-8 h-8 rounded-full border border-gray-200 shadow-sm focus:ring-2 ring-offset-1 ring-red-500"
                :style="{ backgroundColor: color.value }"
                :title="color.name"
             ></button>
              <input 
                type="color" 
                :value="store.activePoster?.backgroundColor || '#ffffff'" 
                @input="(e) => setPosterBackground((e.target as HTMLInputElement).value)" 
                class="w-8 h-8 p-0 border-0 rounded-full overflow-hidden" 
              />
           </div>
        </div>
      </div>

       <!-- Global Alignment (Page) -->
       <div v-if="selectedElement" class="mt-6 pt-6 border-t border-gray-100 space-y-2">
         <label class="text-xs font-semibold text-gray-500 uppercase">Ausrichtung (Seite)</label>
         <div class="flex gap-2">
            <button @click="store.alignElement(selectedElement.id, 'h-center')" class="flex-1 py-1 border rounded hover:bg-gray-50 flex justify-center" title="Horizontal zentrieren">
              <AlignHorizontalJustifyCenter :size="16" />
            </button>
            <button @click="store.alignElement(selectedElement.id, 'v-center')" class="flex-1 py-1 border rounded hover:bg-gray-50 flex justify-center" title="Vertikal zentrieren">
              <AlignVerticalJustifyCenter :size="16" />
            </button>
            <button @click="store.alignElement(selectedElement.id, 'center')" class="flex-1 py-1 border rounded hover:bg-gray-50 flex justify-center" title="Mitte">
              <Crosshair :size="16" />
            </button>
         </div>
       </div>
    </div>

    <!-- Layer Controls -->
    <div v-if="selectedElement" class="p-4 border-t border-gray-100 bg-gray-50 flex justify-between items-center">
       <span class="text-xs font-semibold text-gray-400 uppercase flex items-center gap-2">
         <Layers :size="14" />
         Ebene
       </span>
       <div class="flex gap-2">
           <button @click="store.moveElementDown(selectedElement.id)" class="p-2 border rounded hover:bg-gray-200" title="Nach hinten">
               <ArrowDown :size="16" />
           </button>
           <button @click="store.moveElementUp(selectedElement.id)" class="p-2 border rounded hover:bg-gray-200" title="Nach vorne">
               <ArrowUp :size="16" />
           </button>
           <div class="w-px bg-gray-300 mx-1"></div>
           <button @click="store.deleteElement(selectedElement.id)" class="p-2 border rounded border-red-200 text-red-600 hover:bg-red-50" title="Löschen">
               <Trash2 :size="16" />
           </button>
       </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useEditorStore } from '@/core/store/useEditorStore';
import TextInspector from './TextInspector.vue';
import ImageInspector from './ImageInspector.vue';
import type { TextElement, ImageElement } from '@/core/models/element';
import { colors } from '@/core/styleguide/colors';
import { 
  X, 
  MousePointerClick, 
  AlignHorizontalJustifyCenter, 
  AlignVerticalJustifyCenter, 
  Crosshair,
  Layers,
  ArrowUp,
  ArrowDown,
  Trash2
} from 'lucide-vue-next';

const store = useEditorStore();
const selectedElement = computed(() => store.selectedElement);

const availableColors = [
  { name: 'White', value: colors.palette.white },
  { name: 'Light Gray', value: colors.palette.lightGray },
  { name: 'Medium Gray', value: colors.palette.mediumGray },
  { name: 'Dark Gray', value: colors.palette.darkGray },
  { name: 'TH Red', value: colors.palette.thRed },
  { name: 'Purple', value: colors.palette.purple },
  { name: 'Blue', value: colors.palette.blue },
  { name: 'Green', value: colors.palette.green },
];

function setPosterBackground(color: string) {
  store.updatePoster({ backgroundColor: color });
}

const title = computed(() => {
  if (!selectedElement.value) return 'Eigenschaften';
  switch (selectedElement.value.type) {
    case 'text': return 'Text bearbeiten';
    case 'image': return 'Bild bearbeiten';
    case 'latex': return 'LaTeX Formel';
    default: return 'Eigenschaften';
  }
});
</script>
