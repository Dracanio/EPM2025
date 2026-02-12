<script setup lang="ts">
import { computed, watch } from 'vue'
import { useAuthStore } from '@/core/store/useAuthStore'
import { useEditorStore } from '@/core/store/useEditorStore'
import { useProjectAccessStore } from '@/core/store/useProjectAccessStore'
import type { EditorPermissionKey, InviteTeamMemberInput, ProjectRole, ShareLinkRole } from '@/core/models/accessControl'
import TeamAccessSection from './TeamAccessSection.vue'
import EditorPermissionsSection from './EditorPermissionsSection.vue'

const editorStore = useEditorStore()
const authStore = useAuthStore()
const accessStore = useProjectAccessStore()

const activeProjectId = computed(() => editorStore.activePoster?.id || null)
const activePoster = computed(() => editorStore.activePoster)

watch(
  activeProjectId,
  (projectId) => {
    if (!projectId) return
    accessStore.ensureProjectAccess({
      projectId,
      ownerId: authStore.user?.id || 'current-user',
      ownerName: authStore.user?.name || 'Du',
      ownerEmail: authStore.user?.email || 'owner@poster-designer.app'
    })
  },
  { immediate: true }
)

const projectAccess = computed(() => {
  if (!activeProjectId.value) return null
  return accessStore.getProjectAccess(activeProjectId.value)
})

function addMember(payload: InviteTeamMemberInput) {
  if (!activeProjectId.value) return
  accessStore.addMember(activeProjectId.value, payload)
}

function updateRole(payload: { memberId: string; role: ProjectRole }) {
  if (!activeProjectId.value) return
  accessStore.updateMemberRole(activeProjectId.value, payload.memberId, payload.role)
}

function togglePermission(payload: { permissionKey: EditorPermissionKey; enabled: boolean }) {
  if (!activeProjectId.value || !projectAccess.value) return
  accessStore.toggleEditorPermission(activeProjectId.value, payload.permissionKey, payload.enabled)
}

function createShareLink(payload: { role: ShareLinkRole }) {
  if (!activeProjectId.value) return
  accessStore.createShareLink(activeProjectId.value, payload.role)
}

function updateShareLinkRole(payload: { linkId: string; role: ShareLinkRole }) {
  if (!activeProjectId.value) return
  accessStore.updateShareLinkRole(activeProjectId.value, payload.linkId, payload.role)
}

function toggleShareLink(payload: { linkId: string; enabled: boolean }) {
  if (!activeProjectId.value) return
  accessStore.toggleShareLink(activeProjectId.value, payload.linkId, payload.enabled)
}
</script>

<template>
  <div class="vstack gap-3">
    <section class="settings-card border rounded-4 p-3 bg-light-subtle">
      <h3 class="settings-title mb-2">Projekt Details</h3>
      <div class="small text-secondary">Format</div>
      <div class="fw-semibold mb-2">{{ activePoster?.format || '-' }}</div>
      <div class="small text-secondary">Dokument</div>
      <div class="fw-semibold">{{ activePoster?.widthMm || 0 }} x {{ activePoster?.heightMm || 0 }} mm</div>
    </section>

    <TeamAccessSection
      v-if="projectAccess"
      :members="projectAccess.members"
      :share-links="projectAccess.shareLinks"
      @add-member="addMember"
      @update-role="updateRole"
      @create-share-link="createShareLink"
      @update-share-link-role="updateShareLinkRole"
      @toggle-share-link="toggleShareLink"
    />

    <EditorPermissionsSection
      v-if="projectAccess"
      :permissions="projectAccess.editorPermissions"
      :definitions="accessStore.editorPermissionDefinitions"
      @toggle="togglePermission"
    />
  </div>
</template>

<style scoped>
.settings-card {
  border-color: var(--panel-border);
  background: #ffffff;
}

.settings-title {
  font-size: 1rem;
  font-weight: 700;
}
</style>
