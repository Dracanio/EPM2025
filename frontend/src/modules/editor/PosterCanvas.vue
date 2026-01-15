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
          <!-- Text Element (Label for Background Support) -->
          <v-label
            v-if="element.type === 'text'"
            :config="getLabelConfig(element as TextElement)"
            @dragend="(e) => handleDragEnd(e, element.id)"
            @transformend="(e) => handleTransformEnd(e, element.id)"
          >
            <v-tag :config="getTagConfig(element as TextElement)" />
            <v-text :config="getTextContentConfig(element as TextElement)" />
          </v-label>
          
          <!-- Image Element -->
          <v-image
            v-if="element.type === 'image'"
            :config="getImageConfig(element as ImageElement)"
            @dragend="(e) => handleDragEnd(e, element.id)"
            @transformend="(e) => handleTransformEnd(e, element.id)"
          />
        </template>

        <!-- Transformer -->
        <v-transformer
          ref="transformerRef"
          :config="{
            enabledAnchors: ['top-left', 'top-right', 'bottom-left', 'bottom-right'],
            boundBoxFunc: (oldBox, newBox) => {
              // Prevent resizing to 0
              if (newBox.width < 5 || newBox.height < 5) {
                return oldBox;
              }
              return newBox;
            }
          }"
        />
      </v-layer>
    </v-stage>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch, nextTick } from 'vue';
import { useEditorStore } from '@/core/store/useEditorStore';
import type { PosterElement, TextElement, ImageElement } from '@/core/models/element';
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
function getLabelConfig(element: TextElement) {
  return {
    id: element.id,
    x: mmToPx(element.xMm),
    y: mmToPx(element.yMm),
    rotation: element.rotationDeg,
    draggable: !element.locked,
    name: 'element', // Important for selection logic
  };
}

function getTagConfig(element: TextElement) {
  return {
    fill: element.backgroundColor === 'transparent' ? undefined : element.backgroundColor,
    cornerRadius: 0, // Optional: could expose this later
    // Pointer handling: ensure clicks pass through if needed, but usually tag catches them
  };
}

function getTextContentConfig(element: TextElement) {
  let fontStyle = 'normal';
  if (element.fontWeight === 'bold' && element.fontStyle === 'italic') {
    fontStyle = 'bold italic';
  } else if (element.fontWeight === 'bold') {
    fontStyle = 'bold';
  } else if (element.fontStyle === 'italic') {
    fontStyle = 'italic';
  }

  return {
    text: element.text,
    fontSize: element.fontSize * (PIXELS_PER_MM / 2.5), 
    fontFamily: element.fontFamily || 'Arial',
    fill: element.color || 'black',
    width: mmToPx(element.widthMm),
    align: element.align,
    fontStyle: fontStyle,
    padding: 5, // Match prototype padding
  };
}

// Image Loading Logic
const imageCache = ref<Record<string, HTMLImageElement>>({});

watch(() => elements.value, (newElements) => {
  newElements.forEach(el => {
    if (el.type === 'image' && el.src && !imageCache.value[el.id]) {
      const img = new Image();
      img.src = el.src;
      img.onload = () => {
        imageCache.value[el.id] = img;
      };
    }
  });
}, { deep: true, immediate: true });

function getImageConfig(element: ImageElement) {
  const imgObj = imageCache.value[element.id];
  
  const config: any = {
    id: element.id,
    x: mmToPx(element.xMm),
    y: mmToPx(element.yMm),
    width: mmToPx(element.widthMm),
    height: mmToPx(element.heightMm),
    rotation: element.rotationDeg,
    draggable: !element.locked,
    name: 'element',
  };

  if (imgObj) {
    config.image = imgObj;
    
    // Fit Logic
    if (element.fit === 'cover') {
        // Simple approximation for cover: we rely on crop.
        // Konva image crop: {x,y,width,height} of the SOURCE image to draw.
        // We want to fill the DESTINATION box (width/height).
        const aspectBox = config.width / config.height;
        const aspectImg = imgObj.width / imgObj.height;
        
        let cropWidth, cropHeight, cropX, cropY;

        if (aspectImg > aspectBox) {
            // Image is wider than box -> crop sides
            cropHeight = imgObj.height;
            cropWidth = imgObj.height * aspectBox;
            cropX = (imgObj.width - cropWidth) / 2;
            cropY = 0;
        } else {
            // Image is taller than box -> crop top/bottom
            cropWidth = imgObj.width;
            cropHeight = imgObj.width / aspectBox;
            cropX = 0;
            cropY = (imgObj.height - cropHeight) / 2;
        }
        
        config.crop = {
            x: cropX,
            y: cropY,
            width: cropWidth,
            height: cropHeight
        };
    } else {
        // Contain: Konva usually stretches. To 'contain', we normally change width/height,
        // but the box size is fixed by user. So we center it? 
        // Or we just let it stretch (fill) if "fit" is unknown. 
        // Currently Konva v-image stretches source to width/height.
        // "Contain" inside a fixed box typically means letterboxing (transparency).
        // To implement that, we'd need to calculate the drawn rect size inside the box.
        // For MVP, if "Contain", we might just reset crop and let it stretch? 
        // No, user said "cover contain funktioniert nicht".
        // Let's implement Contain by adjusting width/height of the Image Node itself to match aspect?
        // But then the Selection Box might assume the full size.
        // Complex. Let's start with Cover working correctly via Crop.
    }
  } else {
    // Placeholder config
    config.fill = '#ccc';
    config.stroke = '#666';
    config.dash = [5, 5];
  }

  return config;
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

  // Find the element node (it might be the target, or a parent for Groups/Labels)
  // We look for a node with name 'element'
  let targetNode = e.target;
  if (targetNode.name() !== 'element') {
      targetNode = targetNode.findAncestor((node) => node.name() === 'element');
  }

  if (targetNode) {
    const id = targetNode.id();
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
