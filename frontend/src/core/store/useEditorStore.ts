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
      color: '#000000'
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
    deleteElement
  };
});
