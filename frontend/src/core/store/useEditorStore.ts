import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import type { Poster, PosterFormat } from '../models/poster';
import type { PosterElement } from '../models/element';
import type { Template } from '../models/template';

export const useEditorStore = defineStore('editor', () => {
  // State
  const activePoster = ref<Poster | null>(null);
  const activePageId = ref<string | null>(null);
  const selectedElementId = ref<string | null>(null);
  const zoomLevel = ref<number>(1);
  const isDirty = ref<boolean>(false);

  // Getters
  const activePage = computed(() => {
    if (!activePoster.value || !activePageId.value) return null;
    return activePoster.value.pages.find(p => p.id === activePageId.value) || null;
  });

  const currentElements = computed(() => {
    return activePage.value?.elements || [];
  });

  const selectedElement = computed(() => {
    if (!currentElements.value || !selectedElementId.value) return null;
    return currentElements.value.find(el => el.id === selectedElementId.value) || null;
  });

  // Actions
  function initPoster(format: PosterFormat = 'A4') {
    let width = 210;
    let height = 297;

    if (format === 'A4 Landscape') {
      width = 297;
      height = 210;
    } else if (format === 'Flyer') {
       width = 100; // DIN Lang approx
       height = 210;
    } else if (format === 'A3') {
       width = 297;
       height = 420;
    }

    const titleElement: PosterElement = {
      id: crypto.randomUUID(),
      type: 'text',
      name: 'Title',
      xMm: 20,
      yMm: 20,
      widthMm: width - 40,
      heightMm: 20,
      rotationDeg: 0,
      locked: false,
      text: 'Poster Titel',
      variant: 'title',
      align: 'center',
      fontSize: 27,
      fontFamily: '"Roboto Slab", serif',
      color: '#2B2B2B',
      fontWeight: 'bold',
      fontStyle: 'normal',
      backgroundColor: 'transparent'
    };

    const pageId = crypto.randomUUID();

    activePoster.value = {
      id: crypto.randomUUID(),
      format,
      widthMm: width,
      heightMm: height,
      pages: [
        {
          id: pageId,
          elements: [titleElement]
        }
      ],
      meta: {
        title: 'New Poster',
        ownerId: 'current-user'
      }
    };
    activePageId.value = pageId;
    selectedElementId.value = null;
    zoomLevel.value = 1;
    isDirty.value = false;
  }

  function createPosterFromTemplate(template: Template) {
    // Deep copy pages and elements
    const pagesCopy = template.pages.map(p => ({
      id: crypto.randomUUID(),
      elements: p.elements.map(el => ({
        ...el,
        id: crypto.randomUUID()
      }))
    }));

    const isLandscape = template.format.includes('Landscape');
    const width = isLandscape ? 297 : 210;
    const height = isLandscape ? 210 : 297;

    activePoster.value = {
      id: crypto.randomUUID(),
      templateId: template.id,
      format: template.format as PosterFormat,
      widthMm: width,
      heightMm: height,
      pages: pagesCopy,
      meta: {
        title: `Neu: ${template.name}`,
        ownerId: 'current-user'
      }
    };
    activePageId.value = pagesCopy[0]?.id || null;
    selectedElementId.value = null;
    zoomLevel.value = 1;
    isDirty.value = false;
  }

  function addPage() {
    if (!activePoster.value) return;
    const newPageId = crypto.randomUUID();
    activePoster.value.pages.push({
      id: newPageId,
      elements: []
    });
    activePageId.value = newPageId;
    isDirty.value = true;
  }

  function deletePage(pageId: string) {
    if (!activePoster.value || activePoster.value.pages.length <= 1) return;
    const index = activePoster.value.pages.findIndex(p => p.id === pageId);
    if (index !== -1) {
      activePoster.value.pages.splice(index, 1);
      // If deleted active page, switch to another
      if (activePageId.value === pageId) {
        const newIndex = Math.max(0, index - 1);
        const newPage = activePoster.value.pages[newIndex];
        if (newPage) {
          activePageId.value = newPage.id;
        }
      }
      isDirty.value = true;
    }
  }

  function setActivePage(pageId: string) {
    if (activePoster.value?.pages.some(p => p.id === pageId)) {
      activePageId.value = pageId;
      selectedElementId.value = null; // Clear selection on page switch
    }
  }

  function addElement(element: PosterElement) {
    if (!activePage.value) return;
    activePage.value.elements.push(element);
    selectedElementId.value = element.id;
    isDirty.value = true;
  }

  function updateElement(id: string, partial: Partial<PosterElement>) {
    if (!activePage.value) return;
    const index = activePage.value.elements.findIndex(el => el.id === id);
    if (index !== -1) {
      activePage.value.elements[index] = {
        ...activePage.value.elements[index],
        ...partial
      } as PosterElement;
      isDirty.value = true;
    }
  }

  function updatePoster(partial: Partial<Poster>) {
    if (!activePoster.value) return;
    activePoster.value = {
      ...activePoster.value,
      ...partial
    };
    isDirty.value = true;
  }

  function selectElement(id: string | null) {
    selectedElementId.value = id;
  }

  function deleteElement(id: string) {
    if (!activePage.value) return;
    const index = activePage.value.elements.findIndex(el => el.id === id);
    if (index !== -1) {
      activePage.value.elements.splice(index, 1);
      if (selectedElementId.value === id) {
        selectedElementId.value = null;
      }
      isDirty.value = true;
    }
  }

  function moveElementUp(id: string) {
    if (!activePage.value) return;
    const elements = activePage.value.elements;
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
    if (!activePage.value) return;
    const elements = activePage.value.elements;
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
    if (!activePage.value || !activePoster.value) return;
    const element = activePage.value.elements.find(el => el.id === id);
    if (!element) return;

    const width = activePoster.value.widthMm;
    const height = activePoster.value.heightMm;

    if (type === 'center') {
        element.xMm = (width - element.widthMm) / 2;
        element.yMm = (height - element.heightMm) / 2;
    } else if (type === 'h-center') {
        element.xMm = (width - element.widthMm) / 2;
    } else if (type === 'v-center') {
        element.yMm = (height - element.heightMm) / 2;
    }
    isDirty.value = true;
  }

  function resizePoster(format: PosterFormat, orientation: 'portrait' | 'landscape') {
    if (!activePoster.value) return;

    let width = 210;
    let height = 297;

    if (format === 'A4') {
       width = 210;
       height = 297;
    } else if (format === 'A3') {
       width = 297;
       height = 420;
    } else if (format === 'Flyer') { // DIN Lang / Flyer
       width = 100;
       height = 210;
    }

    // Apply orientation
    if (orientation === 'landscape') {
       // Swap
       const temp = width;
       width = height;
       height = temp;
    }

    activePoster.value.format = format;
    activePoster.value.widthMm = width;
    activePoster.value.heightMm = height;
    
    isDirty.value = true;
  }

  // Zoom Actions
  function zoomIn() {
    zoomLevel.value = Math.min(zoomLevel.value + 0.1, 3.0);
  }

  function zoomOut() {
    zoomLevel.value = Math.max(zoomLevel.value - 0.1, 0.2);
  }

  function setZoom(level: number) {
    zoomLevel.value = Math.max(Math.min(level, 3.0), 0.2);
  }

  return {
    activePoster,
    activePage,
    activePageId,
    currentElements, // Expose this for Canvas
    selectedElementId,
    selectedElement,
    zoomLevel,
    isDirty,
    initPoster,
    createPosterFromTemplate,
    addPage,
    deletePage,
    setActivePage,
    addElement,
    updateElement,
    updatePoster,
    selectElement,
    deleteElement,
    moveElementUp,
    moveElementDown,
    alignElement,
    resizePoster,
    zoomIn,
    zoomOut,
    setZoom
  };
});
