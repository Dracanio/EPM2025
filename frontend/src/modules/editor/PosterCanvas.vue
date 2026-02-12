<template>
  <div :id="containerId" class="poster-stage-shell" 
       :style="{ 
          width: computedStageWidth + 'px', 
          height: computedStageHeight + 'px' 
       }">
    <v-stage
      ref="stageRef"
      :config="stageConfig"
      @mousedown="handleStageMouseDown"
      @touchstart="handleStageMouseDown"
      @dragmove="handleDragMove"
      @dragend="handleDragEndGlobal"
    >
      <v-layer>
        <!-- Background Paper -->
        <v-rect :config="paperConfig" />

        <!-- Grid Lines (Guides) -->
        <v-line 
          v-if="!readOnly"
          v-for="(line, i) in guides" 
          :key="'guide-' + i" 
          :config="{
            points: line.points,
            stroke: '#dd1166', // TH Red
            strokeWidth: 1 / zoomLevel, 
            dash: [4 / zoomLevel, 4 / zoomLevel]
          }" 
        />

        <!-- Elements -->
        <template v-for="element in elementsToRender" :key="element.id">
          <!-- Text Element -->
          <v-label
            v-if="element.type === 'text'"
            :config="getLabelConfig(element as TextElement)"
            @dragend="(e: Konva.KonvaEventObject<DragEvent>) => !readOnly && handleDragEnd(e, element.id)"
            @transformend="(e: Konva.KonvaEventObject<Event>) => !readOnly && handleTransformEnd(e, element.id)"
          >
            <v-tag :config="getTagConfig(element as TextElement)" />
            <v-text :config="getTextContentConfig(element as TextElement)" />
          </v-label>
          
          <!-- Image Element -->
          <v-image
            v-if="element.type === 'image'"
            :config="getImageConfig(element as ImageElement)"
            @dragend="(e: Konva.KonvaEventObject<DragEvent>) => !readOnly && handleDragEnd(e, element.id)"
            @transformend="(e: Konva.KonvaEventObject<Event>) => !readOnly && handleTransformEnd(e, element.id)"
          />
        </template>

        <!-- Transformer (Only if not readOnly) -->
        <v-transformer
          v-if="!readOnly"
          ref="transformerRef"
          :config="{
            boundBoxFunc: (oldBox: any, newBox: any) => {
              if (newBox.width < 5 || newBox.height < 5) return oldBox;
              return newBox;
            }
          }"
        />
      </v-layer>
    </v-stage>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import { useEditorStore } from '@/core/store/useEditorStore';
import type { TextElement, ImageElement, PosterElement } from '@/core/models/element';
import Konva from 'konva';

const props = defineProps<{
  elements?: PosterElement[]; // Optional override
  widthMm?: number;
  heightMm?: number;
  readOnly?: boolean;
  pageId?: string; // To uniquely identify stage if multiple
}>();

const store = useEditorStore();

// Constants
const PIXELS_PER_MM = 3.7795;

// Resolving Props vs Store
const elementsToRender = computed(() => props.elements || store.currentElements);
const activeWidthMm = computed(() => props.widthMm ?? store.activePoster?.widthMm ?? 210);
const activeHeightMm = computed(() => props.heightMm ?? store.activePoster?.heightMm ?? 297);
const zoomLevel = computed(() => props.readOnly ? 1 : store.zoomLevel); // Force zoom 1 for print/readonly if needed, or pass prop? 
// Actually for print we probably want zoom 1.
const isReadOnly = computed(() => props.readOnly || false);

const containerId = computed(() => props.pageId ? `poster-stage-${props.pageId}` : 'poster-stage-container');

// Computeds
const unscaledWidth = computed(() => activeWidthMm.value * PIXELS_PER_MM);
const unscaledHeight = computed(() => activeHeightMm.value * PIXELS_PER_MM);

const computedStageWidth = computed(() => unscaledWidth.value * zoomLevel.value);
const computedStageHeight = computed(() => unscaledHeight.value * zoomLevel.value);

const selectedId = computed(() => store.selectedElementId);

// Stage Config
const stageConfig = computed(() => ({
  width: computedStageWidth.value,
  height: computedStageHeight.value,
  scale: { x: zoomLevel.value, y: zoomLevel.value }
}));

// Paper Config
const paperConfig = computed(() => ({
  width: unscaledWidth.value,
  height: unscaledHeight.value,
  fill: store.activePoster?.backgroundColor || 'white',
  listening: !isReadOnly.value, 
  name: 'background'
}));

// Refs
const stageRef = ref(null);
const transformerRef = ref(null);
const guides = ref<{ points: number[], orientation: 'v' | 'h' }[]>([]);

// Helpers
const mmToPx = (mm: number) => mm * PIXELS_PER_MM;
const pxToMm = (px: number) => px / PIXELS_PER_MM;

const RENARD_SPACINGS_MM = [16.6, 20.8, 26.6, 33.2, 41.5, 52.3, 66.4, 83.0, 104.6, 132.8, 166.0];

function handleDragMove(e: Konva.KonvaEventObject<DragEvent>) {
    if (isReadOnly.value) return;
    
    const node = e.target;
    guides.value = [];
    
    const x = node.x();
    const y = node.y();
    const W = unscaledWidth.value;
    const H = unscaledHeight.value;
    
    let snappedX = x;
    let snappedY = y;
    const SNAP_PX = 10 / zoomLevel.value; 
    
    RENARD_SPACINGS_MM.forEach(mm => {
        const px = mmToPx(mm);
        if (Math.abs(x - px) < SNAP_PX) {
            snappedX = px;
            guides.value.push({ points: [px, 0, px, H], orientation: 'v' });
        }
        const rightPx = W - px;
        if (Math.abs(x - rightPx) < SNAP_PX) {
            snappedX = rightPx;
            guides.value.push({ points: [rightPx, 0, rightPx, H], orientation: 'v' });
        }
    });
    
     RENARD_SPACINGS_MM.forEach(mm => {
        const px = mmToPx(mm);
        if (Math.abs(y - px) < SNAP_PX) {
            snappedY = px;
            guides.value.push({ points: [0, px, W, px], orientation: 'h' });
        }
        const botPx = H - px;
        if (Math.abs(y - botPx) < SNAP_PX) {
            snappedY = botPx;
            guides.value.push({ points: [0, botPx, W, botPx], orientation: 'h' });
        }
    });
    
    node.x(snappedX);
    node.y(snappedY);
}

function handleDragEndGlobal() {
    guides.value = [];
}

function getLabelConfig(element: TextElement) {
  return {
    id: element.id,
    x: mmToPx(element.xMm),
    y: mmToPx(element.yMm),
    rotation: element.rotationDeg,
    draggable: !isReadOnly.value && !element.locked,
    name: 'element',
    dragBoundFunc: function(pos: { x: number, y: number }) {
        return pos;
    }
  };
}

function getTagConfig(element: TextElement) {
  return {
    fill: element.backgroundColor === 'transparent' ? undefined : element.backgroundColor,
    cornerRadius: 0,
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
    padding: 5,
  };
}

const imageCache = ref<Record<string, { src: string, element: HTMLImageElement }>>({});

watch(() => elementsToRender.value, (newElements) => {
  newElements.forEach((el: PosterElement) => {
    if (el.type === 'image' && (el as ImageElement).src) {
      const imgEl = el as ImageElement;
      const cached = imageCache.value[el.id];
      if (!cached || cached.src !== imgEl.src) {
        const img = new Image();
        img.src = imgEl.src!;
        img.crossOrigin = 'Anonymous'; 
        img.onload = () => {
          imageCache.value[el.id] = { src: imgEl.src!, element: img };
        };
      }
    }
  });
}, { deep: true, immediate: true });

function getImageConfig(element: ImageElement) {
  const cached = imageCache.value[element.id];
  const imgObj = cached?.element;
  
  const config: any = {
    id: element.id,
    x: mmToPx(element.xMm),
    y: mmToPx(element.yMm),
    width: mmToPx(element.widthMm),
    height: mmToPx(element.heightMm),
    rotation: element.rotationDeg,
    draggable: !isReadOnly.value && !element.locked,
    name: 'element',
  };

  if (imgObj) {
    config.image = imgObj;
    if (element.fit === 'cover') {
        const aspectBox = config.width / config.height;
        const aspectImg = imgObj.width / imgObj.height;
        let cropWidth, cropHeight, cropX, cropY;

        if (aspectImg > aspectBox) {
            cropHeight = imgObj.height;
            cropWidth = imgObj.height * aspectBox;
            cropX = (imgObj.width - cropWidth) / 2;
            cropY = 0;
        } else {
            cropWidth = imgObj.width;
            cropHeight = imgObj.width / aspectBox;
            cropX = 0;
            cropY = (imgObj.height - cropHeight) / 2;
        }
        config.crop = { x: cropX, y: cropY, width: cropWidth, height: cropHeight };
    }
  } else {
    config.fill = '#ccc';
    config.stroke = '#666';
    config.dash = [5, 5];
  }
  return config;
}

function handleStageMouseDown(e: Konva.KonvaEventObject<MouseEvent>) {
  if (isReadOnly.value) return;

  const isBackground = e.target === e.target.getStage() || e.target.name() === 'background';
  if (isBackground) {
    store.selectElement(null);
    return;
  }
  const parent = e.target.getParent();
  if (parent && parent.className === 'Transformer') return;

  let targetNode: Konva.Node | null = e.target;
  if (targetNode && targetNode.name() !== 'element') {
      targetNode = targetNode.findAncestor((node: Konva.Node) => node.name() === 'element') as Konva.Node | null;
  }

  if (targetNode) {
    store.selectElement(targetNode.id());
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
  node.scaleX(1);
  node.scaleY(1);

  store.updateElement(id, {
    xMm: pxToMm(node.x()),
    yMm: pxToMm(node.y()),
    widthMm: pxToMm(node.width() * scaleX),
    rotationDeg: node.rotation(),
  });
}

// Watch selection but ignore if readOnly
watch(selectedId, (newId) => {
  if (isReadOnly.value) return;
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
