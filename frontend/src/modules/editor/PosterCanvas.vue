<template>
  <div class="shadow-2xl relative bg-white" :style="{ width: stageWidth + 'px', height: stageHeight + 'px' }">
    <v-stage
      ref="stageRef"
      :config="stageConfig"
      @mousedown="handleStageMouseDown"
      @touchstart="handleStageMouseDown"
    >
      <v-layer>
        <!-- Background Paper -->
        <v-rect :config="paperConfig" />

        <!-- Elements -->
        <template v-for="element in elements" :key="element.id">
          <!-- Text Element -->
          <v-text
            v-if="element.type === 'text'"
            :config="getTextConfig(element)"
            @dragend="(e) => handleDragEnd(e, element.id)"
            @transformend="(e) => handleTransformEnd(e, element.id)"
          />
          
          <!-- Image Element (Placeholder for now) -->
            <v-rect
            v-if="element.type === 'image'"
            :config="getPlaceholderImageConfig(element)"
            @dragend="(e) => handleDragEnd(e, element.id)"
            @transformend="(e) => handleTransformEnd(e, element.id)"
          />
        </template>

        <!-- Transformer -->
        <v-transformer ref="transformerRef" />
      </v-layer>
    </v-stage>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch, nextTick } from 'vue';
import { useEditorStore } from '@/core/store/useEditorStore';
import type { PosterElement, TextElement } from '@/core/models/element';
import Konva from 'konva';

const store = useEditorStore();

// Constants
const PIXELS_PER_MM = 3.7795;
const A4_WIDTH_MM = 210;
const A4_HEIGHT_MM = 297;

// Computeds
const stageWidth = A4_WIDTH_MM * PIXELS_PER_MM;
const stageHeight = A4_HEIGHT_MM * PIXELS_PER_MM;

const elements = computed(() => store.activePoster?.elements || []);
const selectedId = computed(() => store.selectedElementId);

// Stage Config
const stageConfig = {
  width: stageWidth,
  height: stageHeight,
};

// Paper Config
const paperConfig = {
  width: stageWidth,
  height: stageHeight,
  fill: 'white',
  listening: false, // Background shouldn't intercept clicks for selection unless we want to deselect
};

// Refs
const stageRef = ref(null);
const transformerRef = ref(null);

// Helpers
const mmToPx = (mm: number) => mm * PIXELS_PER_MM;
const pxToMm = (px: number) => px / PIXELS_PER_MM;

// Config Generators
function getTextConfig(element: TextElement) {
  return {
    id: element.id,
    x: mmToPx(element.xMm),
    y: mmToPx(element.yMm),
    text: element.text,
    fontSize: element.fontSize * (PIXELS_PER_MM / 2.5), // Approx scale for now, refinement needed for pt vs px
    fontFamily: element.fontFamily || 'Arial',
    fill: element.color || 'black',
    width: mmToPx(element.widthMm),
    rotation: element.rotationDeg,
    draggable: !element.locked,
    name: 'element', // for selection filtering
  };
}

function getPlaceholderImageConfig(element: PosterElement) {
   return {
    id: element.id,
    x: mmToPx(element.xMm),
    y: mmToPx(element.yMm),
    width: mmToPx(element.widthMm),
    height: mmToPx(element.heightMm),
    fill: '#ccc',
    stroke: '#666',
    dash: [5, 5],
    rotation: element.rotationDeg,
    draggable: !element.locked,
    name: 'element',
   }
}

// Interaction Handlers
function handleStageMouseDown(e: Konva.KonvaEventObject<MouseEvent>) {
  // clicked on stage - clear selection
  if (e.target === e.target.getStage()) {
    store.selectElement(null);
    return;
  }

  // clicked on transformer - do nothing
  const clickedOnTransformer = e.target.getParent().className === 'Transformer';
  if (clickedOnTransformer) {
    return;
  }

  // find name
  const name = e.target.name();
  if (name === 'element') {
    const id = e.target.id();
    store.selectElement(id);
  } else {
    store.selectElement(null);
  }
}

function handleDragEnd(e: Konva.KonvaEventObject<DragEvent>, id: string) {
  const node = e.target;
  store.updateElement(id, {
    xMm: pxToMm(node.x()),
    yMm: pxToMm(node.y()),
  });
}

function handleTransformEnd(e: Konva.KonvaEventObject<Event>, id: string) {
  const node = e.target;
  const scaleX = node.scaleX();
  const scaleY = node.scaleY();

  // Reset scale and update width/height instead (to avoid scaling artifacts on text)
  node.scaleX(1);
  node.scaleY(1);

  store.updateElement(id, {
    xMm: pxToMm(node.x()),
    yMm: pxToMm(node.y()),
    widthMm: pxToMm(node.width() * scaleX),
    // For text, height is often auto, but we can track it. 
    // If it's an image, height matters. 
    // For text, we might only care about width.
    rotationDeg: node.rotation(),
  });
  
  // Update node dimensions immediately for UI sync if needed, though reactivity handles it
}

// Watch Selection to update Transformer
watch(selectedId, (newId) => {
  const transformerNode = (transformerRef.value as any)?.getNode();
  const stage = (stageRef.value as any)?.getStage();
  
  if (!transformerNode || !stage) return;

  if (!newId) {
    transformerNode.nodes([]);
    transformerNode.getLayer().batchDraw();
    return;
  }

  const selectedNode = stage.findOne('#' + newId);
  if (selectedNode) {
    transformerNode.nodes([selectedNode]);
    transformerNode.getLayer().batchDraw();
  } else {
    transformerNode.nodes([]);
  }
});

</script>
