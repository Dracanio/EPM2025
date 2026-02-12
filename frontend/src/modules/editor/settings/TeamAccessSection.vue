<script setup lang="ts">
import { computed, ref } from 'vue'
import type { InviteTeamMemberInput, ProjectRole, ProjectTeamAccess, ShareLinkRole, TeamMember } from '@/core/models/accessControl'
import type { TeamWorkspace } from '@/core/models/teamWorkspace'
import { Plus, ShieldCheck, Trash2, Users } from 'lucide-vue-next'

const props = defineProps<{
  members: TeamMember[]
  teamAccesses: ProjectTeamAccess[]
  availableTeams: TeamWorkspace[]
}>()

const emit = defineEmits<{
  (e: 'add-member', payload: InviteTeamMemberInput): void
  (e: 'update-role', payload: { memberId: string; role: ProjectRole }): void
  (e: 'add-team-access', payload: { teamId: string; role: ShareLinkRole }): void
  (e: 'update-team-access-role', payload: { accessId: string; role: ShareLinkRole }): void
  (e: 'remove-team-access', payload: { accessId: string }): void
}>()

const newMemberName = ref('')
const newMemberEmail = ref('')
const newMemberRole = ref<InviteTeamMemberInput['role']>('editor')
const inviteError = ref('')

const selectedTeamId = ref('')
const selectedTeamRole = ref<ShareLinkRole>('viewer')
const teamAccessError = ref('')

const ownerMember = computed(() => props.members.find((member) => member.role === 'owner'))
const managedMembers = computed(() => props.members.filter((member) => member.role !== 'owner'))

const availableTeamOptions = computed(() => {
  const assignedTeamIds = new Set(props.teamAccesses.map((entry) => entry.teamId))
  return props.availableTeams.filter((entry) => !assignedTeamIds.has(entry.id))
})

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

function submitTeamAccess() {
  if (!selectedTeamId.value) {
    teamAccessError.value = 'Bitte zuerst ein Team auswaehlen.'
    return
  }

  teamAccessError.value = ''
  emit('add-team-access', {
    teamId: selectedTeamId.value,
    role: selectedTeamRole.value
  })

  selectedTeamId.value = ''
  selectedTeamRole.value = 'viewer'
}

function updateTeamAccessRole(accessId: string, event: Event) {
  const role = (event.target as HTMLSelectElement).value as ShareLinkRole
  emit('update-team-access-role', { accessId, role })
}

function removeTeamAccess(accessId: string) {
  emit('remove-team-access', { accessId })
}
</script>

<template>
  <section class="settings-card border rounded-4 p-3">
    <header class="mb-3">
      <h3 class="settings-title mb-1">Team & Zugriff</h3>
      <p class="text-secondary mb-0">Direkte Mitglieder und Team-Zugriffe fuer dieses Projekt verwalten.</p>
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

    <div class="border rounded-3 p-2 team-access-wrapper">
      <div class="d-flex align-items-center justify-content-between gap-2 mb-2">
        <p class="mb-0 fw-semibold d-inline-flex align-items-center gap-1">
          <Users :size="14" />
          Projekt-Teams
        </p>
        <span class="small text-secondary">{{ teamAccesses.length }} verknuepft</span>
      </div>

      <div class="row g-2 mb-2">
        <div class="col-12">
          <select v-model="selectedTeamId" class="form-select form-select-sm">
            <option value="">Team aus Profil waehlen</option>
            <option v-for="team in availableTeamOptions" :key="team.id" :value="team.id">
              {{ team.name }} ({{ team.memberEmails.length }} Mitglieder)
            </option>
          </select>
        </div>
        <div class="col-7">
          <select v-model="selectedTeamRole" class="form-select form-select-sm">
            <option value="viewer">Viewer</option>
            <option value="editor">Editor</option>
          </select>
        </div>
        <div class="col-5">
          <button
            type="button"
            class="btn btn-outline-secondary btn-sm w-100 d-inline-flex align-items-center justify-content-center gap-1"
            :disabled="availableTeamOptions.length === 0"
            @click="submitTeamAccess"
          >
            <Plus :size="14" />
            Team
          </button>
        </div>
      </div>

      <div v-if="teamAccessError" class="small text-danger mb-2">{{ teamAccessError }}</div>
      <div v-else-if="availableTeams.length === 0" class="small text-secondary mb-2">
        Keine Teams im Profil vorhanden. Lege zuerst ein Team im Profilbereich an.
      </div>
      <div v-else-if="availableTeamOptions.length === 0" class="small text-secondary mb-2">
        Alle verfuegbaren Teams sind bereits mit dem Projekt verknuepft.
      </div>

      <div v-if="teamAccesses.length === 0" class="small text-secondary">Noch kein Team verknuepft.</div>
      <div v-else class="vstack gap-2">
        <article v-for="entry in teamAccesses" :key="entry.id" class="team-access-row">
          <div>
            <p class="fw-semibold mb-0">{{ entry.teamName }}</p>
            <p class="small text-secondary mb-0">{{ entry.memberEmails.length }} Mitglieder</p>
          </div>

          <div class="d-flex align-items-center gap-2">
            <select class="form-select form-select-sm team-access-role-select" :value="entry.role" @change="updateTeamAccessRole(entry.id, $event)">
              <option value="viewer">Viewer</option>
              <option value="editor">Editor</option>
            </select>
            <button type="button" class="btn btn-outline-danger btn-sm" title="Teamzugriff loeschen" @click="removeTeamAccess(entry.id)">
              <Trash2 :size="14" />
            </button>
          </div>
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

.team-access-wrapper {
  border-color: var(--panel-border) !important;
  background: #f8fafc;
}

.team-access-row {
  border: 1px solid var(--panel-border);
  border-radius: 0.75rem;
  padding: 0.5rem;
  background: #ffffff;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.5rem;
  flex-wrap: wrap;
}

.team-access-role-select {
  width: 140px;
}
</style>
