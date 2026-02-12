<script setup lang="ts">
import { computed, ref } from 'vue'
import type { InviteTeamMemberInput, ProjectRole, ShareLink, ShareLinkRole, TeamMember } from '@/core/models/accessControl'
import { Copy, Link2, Plus, ShieldCheck } from 'lucide-vue-next'

const props = defineProps<{
  members: TeamMember[]
  shareLinks: ShareLink[]
}>()

const emit = defineEmits<{
  (e: 'add-member', payload: InviteTeamMemberInput): void
  (e: 'update-role', payload: { memberId: string; role: ProjectRole }): void
  (e: 'create-share-link', payload: { role: ShareLinkRole }): void
  (e: 'update-share-link-role', payload: { linkId: string; role: ShareLinkRole }): void
  (e: 'toggle-share-link', payload: { linkId: string; enabled: boolean }): void
}>()

const newMemberName = ref('')
const newMemberEmail = ref('')
const newMemberRole = ref<InviteTeamMemberInput['role']>('editor')
const inviteError = ref('')

const newLinkRole = ref<ShareLinkRole>('viewer')
const copiedLinkId = ref<string | null>(null)

const ownerMember = computed(() => props.members.find((member) => member.role === 'owner'))
const managedMembers = computed(() => props.members.filter((member) => member.role !== 'owner'))

function initialsFor(name: string) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((token) => token[0]?.toUpperCase() || '')
    .join('')
}

function submitMember() {
  const name = newMemberName.value.trim()
  const email = newMemberEmail.value.trim().toLowerCase()

  if (!name || !email) {
    inviteError.value = 'Name und E-Mail sind erforderlich.'
    return
  }

  const hasSimpleEmailShape = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
  if (!hasSimpleEmailShape) {
    inviteError.value = 'Bitte eine gueltige E-Mail angeben.'
    return
  }

  const exists = props.members.some((member) => member.email.trim().toLowerCase() === email)
  if (exists) {
    inviteError.value = 'Diese E-Mail ist bereits im Team.'
    return
  }

  inviteError.value = ''
  emit('add-member', {
    name,
    email,
    role: newMemberRole.value
  })

  newMemberName.value = ''
  newMemberEmail.value = ''
  newMemberRole.value = 'editor'
}

function onRoleChange(memberId: string, event: Event) {
  const nextRole = (event.target as HTMLSelectElement).value as ProjectRole
  emit('update-role', { memberId, role: nextRole })
}

function createShareLink() {
  emit('create-share-link', {
    role: newLinkRole.value
  })
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
</script>

<template>
  <section class="settings-card border rounded-4 p-3">
    <header class="mb-3">
      <h3 class="settings-title mb-1">Team & Zugriff</h3>
      <p class="text-secondary mb-0">Owner, Editoren und Viewer fuer dieses Projekt verwalten.</p>
    </header>

    <div class="row g-2 mb-3">
      <div class="col-12">
        <input v-model="newMemberName" type="text" class="form-control form-control-sm" placeholder="Name des Mitglieds" />
      </div>
      <div class="col-12">
        <input v-model="newMemberEmail" type="email" class="form-control form-control-sm" placeholder="mitglied@beispiel.de" />
      </div>
      <div class="col-7">
        <select v-model="newMemberRole" class="form-select form-select-sm">
          <option value="editor">Editor</option>
          <option value="viewer">Viewer</option>
        </select>
      </div>
      <div class="col-5">
        <button
          type="button"
          class="btn btn-primary btn-sm w-100 d-inline-flex align-items-center justify-content-center gap-1"
          @click="submitMember"
        >
          <Plus :size="14" />
          Hinzu
        </button>
      </div>
      <div v-if="inviteError" class="col-12">
        <p class="small text-danger mb-0">{{ inviteError }}</p>
      </div>
    </div>

    <div class="vstack gap-2 mb-3">
      <article v-if="ownerMember" class="member-row">
        <div class="member-avatar">{{ initialsFor(ownerMember.name) }}</div>
        <div class="member-info">
          <p class="member-name mb-0">
            {{ ownerMember.name }}
            <span class="text-secondary">(Owner)</span>
          </p>
          <p class="member-mail mb-0">{{ ownerMember.email }}</p>
        </div>
        <span class="badge role-badge role-badge-owner d-inline-flex align-items-center gap-1">
          <ShieldCheck :size="12" />
          Owner
        </span>
      </article>

      <article v-for="member in managedMembers" :key="member.id" class="member-row">
        <div class="member-avatar">{{ initialsFor(member.name) }}</div>
        <div class="member-info">
          <p class="member-name mb-0">{{ member.name }}</p>
          <p class="member-mail mb-0">{{ member.email }}</p>
        </div>

        <select class="form-select form-select-sm member-role-select" :value="member.role" @change="onRoleChange(member.id, $event)">
          <option value="editor">Editor</option>
          <option value="viewer">Viewer</option>
        </select>
      </article>
    </div>

    <div class="share-links border rounded-3 p-2">
      <div class="d-flex align-items-center justify-content-between gap-2 mb-2">
        <p class="mb-0 fw-semibold">Freigabe-Links</p>
        <span class="small text-secondary">{{ shareLinks.length }} aktiv/inaktiv</span>
      </div>

      <div class="row g-2 mb-2">
        <div class="col-7">
          <select v-model="newLinkRole" class="form-select form-select-sm">
            <option value="viewer">Link: Nur ansehen</option>
            <option value="editor">Link: Bearbeiten</option>
          </select>
        </div>
        <div class="col-5">
          <button type="button" class="btn btn-outline-secondary btn-sm w-100 d-inline-flex align-items-center justify-content-center gap-1" @click="createShareLink">
            <Link2 :size="14" />
            Erstellen
          </button>
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

.member-row {
  display: grid;
  grid-template-columns: auto 1fr;
  gap: 0.6rem;
  border: 1px solid var(--panel-border);
  border-radius: 0.85rem;
  padding: 0.55rem 0.65rem;
  background: #ffffff;
}

.member-avatar {
  width: 2rem;
  height: 2rem;
  border-radius: 999px;
  background: #dbe7fb;
  color: #22304a;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-size: 0.72rem;
  font-weight: 700;
  flex-shrink: 0;
}

.member-info {
  min-width: 0;
}

.member-name {
  font-size: 0.92rem;
  font-weight: 600;
}

.member-mail {
  font-size: 0.8rem;
  color: var(--text-muted);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.member-role-select {
  grid-column: 1 / -1;
  width: 100%;
}

.role-badge {
  border-radius: 999px;
  font-size: 0.72rem;
  padding: 0.3rem 0.55rem;
  grid-column: 1 / -1;
  width: fit-content;
}

.role-badge-owner {
  background: #eef3ff;
  color: #2a4ca0;
  border: 1px solid #cedbff;
}

.share-links {
  border-color: var(--panel-border) !important;
  background: #f8fafc;
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
</style>

