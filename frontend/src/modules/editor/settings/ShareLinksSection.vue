<script setup lang="ts">
import { ref } from 'vue'
import type { ShareLink, ShareLinkRole } from '@/core/models/accessControl'
import { Copy, Link2, Trash2 } from 'lucide-vue-next'

const props = defineProps<{
  shareLinks: ShareLink[]
}>()

const emit = defineEmits<{
  (e: 'create-share-link', payload: { role: ShareLinkRole }): void
  (e: 'update-share-link-role', payload: { linkId: string; role: ShareLinkRole }): void
  (e: 'toggle-share-link', payload: { linkId: string; enabled: boolean }): void
  (e: 'delete-share-link', payload: { linkId: string }): void
}>()

const copiedLinkId = ref<string | null>(null)

function createShareLink(role: ShareLinkRole) {
  emit('create-share-link', { role })
}

function linkUrl(token: string) {
  return `${window.location.origin}/shared/${token}`
}

async function copyLink(linkId: string, token: string) {
  const value = linkUrl(token)
  try {
    await navigator.clipboard.writeText(value)
    copiedLinkId.value = linkId
    setTimeout(() => {
      if (copiedLinkId.value === linkId) copiedLinkId.value = null
    }, 1300)
  } catch {
    copiedLinkId.value = null
  }
}

function updateShareRole(linkId: string, event: Event) {
  const role = (event.target as HTMLSelectElement).value as ShareLinkRole
  emit('update-share-link-role', { linkId, role })
}

function toggleShare(linkId: string, event: Event) {
  emit('toggle-share-link', {
    linkId,
    enabled: (event.target as HTMLInputElement).checked
  })
}

function deleteShareLink(linkId: string) {
  emit('delete-share-link', { linkId })
}
</script>

<template>
  <section class="settings-card border rounded-4 p-3">
    <header class="mb-3">
      <h3 class="settings-title mb-1">Freigabe-Links</h3>
      <p class="text-secondary mb-0">Links fuer Viewer oder Editoren erstellen und steuern.</p>
    </header>

    <div class="d-flex align-items-center justify-content-between gap-2 mb-2">
      <p class="mb-0 fw-semibold">Links</p>
      <span class="small text-secondary">{{ shareLinks.length }} aktiv/inaktiv</span>
    </div>

    <div class="row g-2 mb-2">
      <div class="col-12">
        <div class="btn-group btn-group-sm w-100 share-link-create-group" role="group" aria-label="Freigabe-Link erstellen">
          <button type="button" class="btn btn-outline-secondary d-inline-flex align-items-center justify-content-center gap-1" @click="createShareLink('viewer')">
            <Link2 :size="14" />
            Nur ansehen
          </button>
          <button type="button" class="btn btn-outline-secondary d-inline-flex align-items-center justify-content-center gap-1" @click="createShareLink('editor')">
            <Link2 :size="14" />
            Bearbeiten
          </button>
        </div>
      </div>
    </div>

    <div v-if="shareLinks.length === 0" class="small text-secondary">Noch kein Link erstellt.</div>

    <div v-else class="vstack gap-2">
      <article v-for="link in shareLinks" :key="link.id" class="share-link-row">
        <div class="input-group input-group-sm mb-2">
          <input type="text" class="form-control" :value="linkUrl(link.token)" readonly />
          <button type="button" class="btn btn-outline-secondary" @click="copyLink(link.id, link.token)">
            <Copy :size="14" />
          </button>
          <button type="button" class="btn btn-outline-danger" title="Link loeschen" @click="deleteShareLink(link.id)">
            <Trash2 :size="14" />
          </button>
        </div>

        <div class="d-flex align-items-center justify-content-between gap-2 flex-wrap">
          <select class="form-select form-select-sm share-role-select" :value="link.role" @change="updateShareRole(link.id, $event)">
            <option value="viewer">Viewer Link</option>
            <option value="editor">Editor Link</option>
          </select>

          <div class="form-check form-switch m-0">
            <input class="form-check-input" type="checkbox" :checked="link.isActive" @change="toggleShare(link.id, $event)" />
          </div>
        </div>
        <p v-if="copiedLinkId === link.id" class="small text-success mb-0 mt-1">Link kopiert.</p>
      </article>
    </div>
  </section>
</template>

<style scoped>
.settings-card {
  background: #ffffff;
  border-color: var(--panel-border);
}

.settings-title {
  font-size: 1rem;
  font-weight: 700;
}

.share-link-row {
  border: 1px solid var(--panel-border);
  border-radius: 0.75rem;
  padding: 0.5rem;
  background: #ffffff;
}

.share-role-select {
  width: 160px;
}

.share-link-create-group .btn {
  width: 50%;
}
</style>
