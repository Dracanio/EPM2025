<script setup lang="ts">
import { onMounted, computed, ref, nextTick } from 'vue'
import Sidebar from './Sidebar.vue'
import PosterCanvas from './PosterCanvas.vue'
import { useEditorStore } from '@/core/store/useEditorStore'
import { downloadPdf } from '@/core/utils/exportPdf'
import type { PosterFormat } from '@/core/models/poster';

const store = useEditorStore()

// Local state for UI controls (synced with store)
const currentFormat = computed(() => {
    return store.activePoster?.format.split(' ')[0] || 'A4';
});

const currentOrientation = computed(() => {
    if (!store.activePoster) return 'portrait';
    return store.activePoster.widthMm > store.activePoster.heightMm ? 'landscape' : 'portrait';
});

function changeFormat(val: string) {
    store.resizePoster(val as PosterFormat, currentOrientation.value);
}

function setOrientation(val: 'portrait' | 'landscape') {
    store.resizePoster(currentFormat.value as PosterFormat, val);
}

function handlePrint() {
    window.print();
}

// Export Handling
const isExporting = ref(false);

async function handleExportPdf() {
    isExporting.value = true;
    // Wait for DOM update so the hidden print container becomes visible?
    // Actually we can't easily make it visible without flashing on screen if we use display:none.
    // One trick: position absolute, top -9999px.
    // The print container below has 'hidden' class usually.
    // We toggle a ref to show it for export.
    
    await nextTick();
    
    // Give images a moment?
    setTimeout(async () => {
        await downloadPdf('poster-print-page', `${store.activePoster?.meta.title || 'poster'}.pdf`);
        isExporting.value = false;
    }, 500);
}


onMounted(() => {
  if (!store.activePoster) {
    store.initPoster('A4')
  }
})
</script>

<template>
  <div class="flex h-screen w-screen overflow-hidden bg-gray-100 print:bg-white print:h-auto print:overflow-visible">
    <!-- Sidebar (Hidden on Print) -->
    <Sidebar class="print:hidden" />
    
    <!-- Main Canvas Area -->
    <main class="flex-1 relative flex flex-col overflow-hidden print:overflow-visible print:block">
      <!-- Top Bar (Hidden on Print) -->
      <header class="h-14 bg-white border-b border-gray-200 flex items-center px-4 justify-between shrink-0 z-20 shadow-sm print:hidden">
        <div class="text-sm text-gray-500 flex items-center gap-4">
          <div>
             <router-link to="/templates" class="hover:text-red-600">Templates</router-link>
             <span class="mx-2">/</span>
             <span>Editor</span>
          </div>

          <div class="h-6 w-px bg-gray-300 mx-2"></div>

          <!-- Format Controls -->
          <div class="flex items-center gap-2">
            <select 
              :value="currentFormat" 
              @change="e => changeFormat((e.target as HTMLSelectElement).value)"
              class="text-xs border border-gray-300 rounded p-1"
            >
              <option value="A4">A4</option>
              <option value="A3">A3</option>
              <option value="Flyer">Flyer (DIN Lang)</option>
            </select>

            <div class="flex border border-gray-300 rounded overflow-hidden">
               <button 
                @click="setOrientation('portrait')"
                :class="['p-1 hover:bg-gray-50', currentOrientation === 'portrait' ? 'bg-gray-100 text-red-600' : 'text-gray-500']"
                title="Hochformat"
               >
                 <svg width="12" height="16" viewBox="0 0 12 16" class="fill-current">
                    <rect x="1" y="1" width="10" height="14" rx="1" stroke="currentColor" stroke-width="1.5" fill="none" />
                 </svg>
               </button>
               <button 
                @click="setOrientation('landscape')"
                :class="['p-1 hover:bg-gray-50', currentOrientation === 'landscape' ? 'bg-gray-100 text-red-600' : 'text-gray-500']"
                title="Querformat"
               >
                 <svg width="16" height="12" viewBox="0 0 16 12" class="fill-current">
                    <rect x="1" y="1" width="14" height="10" rx="1" stroke="currentColor" stroke-width="1.5" fill="none" />
                 </svg>
               </button>
            </div>
          </div>
          
          <div class="h-6 w-px bg-gray-300 mx-2"></div>
          
           <!-- Pages Controls -->
          <div class="flex items-center gap-2" v-if="store.activePoster && store.activePoster.pages.length > 0">
             <span class="text-xs font-medium">Seite:</span>
             <div class="flex border border-gray-300 rounded overflow-hidden">
                <button 
                    v-for="(page, idx) in store.activePoster.pages" 
                    :key="page.id"
                    @click="store.setActivePage(page.id)"
                    :class="['px-2 py-1 text-xs hover:bg-gray-50 border-r last:border-r-0', store.activePageId === page.id ? 'bg-gray-100 text-red-600 font-bold' : 'text-gray-600']"
                >
                    {{ idx + 1 }}
                </button>
             </div>
             <button @click="store.addPage()" class="text-xs bg-gray-100 hover:bg-gray-200 px-2 py-1 rounded border border-gray-300" title="Seite hinzufügen">+</button>
             <button v-if="store.activePoster.pages.length > 1" @click="store.deletePage(store.activePageId!)" class="text-xs text-red-600 hover:bg-red-50 px-2 py-1 rounded border border-red-200" title="Seite löschen">x</button>
          </div>

        </div>
        
        <div class="flex items-center gap-4">
          <!-- Zoom Controls -->
          <div class="flex items-center gap-1 bg-white border border-gray-300 rounded-lg p-1">
             <button @click="store.zoomOut()" class="w-6 h-6 flex items-center justify-center text-gray-600 hover:bg-gray-100 rounded">-</button>
             <span class="text-xs w-12 text-center select-none">{{ Math.round(store.zoomLevel * 100) }}%</span>
             <button @click="store.zoomIn()" class="w-6 h-6 flex items-center justify-center text-gray-600 hover:bg-gray-100 rounded">+</button>
          </div>

          <button 
            @click="handleExportPdf"
            class="bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 px-4 py-1.5 rounded text-sm font-medium flex items-center gap-2"
          >
             <span v-if="isExporting">Exporting...</span>
             <span v-else>PDF Export</span>
          </button>

          <button 
            @click="handlePrint"
            class="bg-gray-800 hover:bg-gray-900 text-white px-4 py-1.5 rounded text-sm font-medium flex items-center gap-2"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 6 2 18 2 18 9"></polyline><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"></path><rect x="6" y="14" width="12" height="8"></rect></svg>
            Drucken
          </button>
        </div>
      </header>

      <!-- Interactive Canvas (Active Page Only) -->
      <!-- Hidden on print -->
      <div class="flex-1 overflow-auto bg-gray-100 flex items-start justify-center p-8 relative z-0 print:hidden">
         <PosterCanvas v-if="store.activePoster" />
      </div>

      <!-- Print / Export View (All Pages) -->
      <!-- Visible only on print or when exporting -->
      <!-- We use 'hidden' normally, 'block' on print. 
           For export, we conditionally remove 'hidden' via style or class toggling with isExporting -->
      <div 
        :class="['print:block print:w-full print:h-auto print:static', isExporting ? 'absolute top-0 left-0 z-50 pointer-events-none opacity-0' : 'hidden']"
      >
        <div v-for="page in store.activePoster?.pages" :key="page.id" class="poster-print-page print:mb-8 print:break-after-page mb-8">
            <PosterCanvas 
                :elements="page.elements" 
                :widthMm="store.activePoster?.widthMm"
                :heightMm="store.activePoster?.heightMm"
                :readOnly="true"
                :pageId="page.id"
            />
        </div>
      </div>
    </main>
  </div>
</template>

<style>
@media print {
  @page {
    margin: 0;
    size: auto; 
  }
  body {
    -webkit-print-color-adjust: exact;
    print-color-adjust: exact;
  }
  
  /* Ensure canvas is visible and formatted */
  #poster-stage-container {
      box-shadow: none !important;
      margin: 0 auto;
  }
  
  /* Hide scrollbars etc */
  ::-webkit-scrollbar {
    display: none;
  }
}
</style>
