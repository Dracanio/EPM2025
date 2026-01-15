import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import type { Poster, PosterFormat } from '../models/poster';
import type { PosterElement } from '../models/element';

export const useEditorStore = defineStore('editor', () => {
  // State
  const activePoster = ref<Poster | null>(null);
  const selectedElementId = ref<string | null>(null);
  const zoomLevel = ref<number>(1);
  const isDirty = ref<boolean>(false);

  // Getters
  const selectedElement = computed(() => {
    if (!activePoster.value || !selectedElementId.value) return null;
    return activePoster.value.elements.find(el => el.id === selectedElementId.value) || null;
  });

  // Actions
  function initPoster(format: PosterFormat = 'A4') {
    const titleElement: PosterElement = {
      id: crypto.randomUUID(),
      type: 'text',
      name: 'Title',
      xMm: 20,
      yMm: 20,
      widthMm: 170, // Full width minus margins
      heightMm: 20,
      rotationDeg: 0,
      locked: false,
      text: 'Poster Titel',
      variant: 'title',
      align: 'center',
      fontSize: 48,
      fontFamily: 'Arial',
      color: '#000000',
      fontWeight: 'bold',
      fontStyle: 'normal',
      backgroundColor: 'transparent'
    };

    activePoster.value = {
      id: crypto.randomUUID(),
      format,
      elements: [titleElement],
      meta: {
        title: 'New Poster',
        ownerId: 'current-user'
      }
    };
    selectedElementId.value = null;
    isDirty.value = false;
  }

  function addElement(element: PosterElement) {
    if (!activePoster.value) return;
    activePoster.value.elements.push(element);
    selectedElementId.value = element.id;
    isDirty.value = true;
  }

  function updateElement(id: string, partial: Partial<PosterElement>) {
    if (!activePoster.value) return;
    const index = activePoster.value.elements.findIndex(el => el.id === id);
    if (index !== -1) {
      activePoster.value.elements[index] = {
        ...activePoster.value.elements[index],
        ...partial
      } as PosterElement;
      isDirty.value = true;
    }
  }

  function selectElement(id: string | null) {
    selectedElementId.value = id;
  }

  function deleteElement(id: string) {
    if (!activePoster.value) return;
    const index = activePoster.value.elements.findIndex(el => el.id === id);
    if (index !== -1) {
      activePoster.value.elements.splice(index, 1);
      if (selectedElementId.value === id) {
        selectedElementId.value = null;
      }
      isDirty.value = true;
    }
  }

  function moveElementUp(id: string) {
    if (!activePoster.value) return;
    const elements = activePoster.value.elements;
    const index = elements.findIndex(el => el.id === id);
    if (index === -1 || index === elements.length - 1) return;
    
    // Swap with next
    const temp = elements[index];
    const next = elements[index + 1];
    if (temp && next) {
        elements[index] = next;
        elements[index + 1] = temp;
        isDirty.value = true;
    }
  }

  function moveElementDown(id: string) {
    if (!activePoster.value) return;
    const elements = activePoster.value.elements;
    const index = elements.findIndex(el => el.id === id);
    if (index <= 0) return;
    
    // Swap with previous
    const temp = elements[index];
    const prev = elements[index - 1];
    if (temp && prev) {
       elements[index] = prev;
       elements[index - 1] = temp;
       isDirty.value = true;
    }
  }

  function alignElement(id: string, type: 'center' | 'h-center' | 'v-center') {
    if (!activePoster.value) return;
    const element = activePoster.value.elements.find(el => el.id === id);
    if (!element) return;

    const A4_WIDTH = 210;
    const A4_HEIGHT = 297;

    if (type === 'center') {
        element.xMm = (A4_WIDTH - element.widthMm) / 2;
        element.yMm = (A4_HEIGHT - element.heightMm) / 2;
    } else if (type === 'h-center') {
        element.xMm = (A4_WIDTH - element.widthMm) / 2;
    } else if (type === 'v-center') {
        element.yMm = (A4_HEIGHT - element.heightMm) / 2;
    }
    isDirty.value = true;
  }

  return {
    activePoster,
    selectedElementId,
    selectedElement,
    zoomLevel,
    isDirty,
    initPoster,
    addElement,
    updateElement,
    selectElement,
    deleteElement,
    moveElementUp,
    moveElementDown,
    alignElement
  };
});
