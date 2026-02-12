<script setup lang="ts">
import { computed, ref } from 'vue'
import type { InviteTeamMemberInput, ProjectRole, TeamMember } from '@/core/models/accessControl'
import { Plus, ShieldCheck } from 'lucide-vue-next'

const props = defineProps<{
  members: TeamMember[]
}>()

const emit = defineEmits<{
  (e: 'add-member', payload: InviteTeamMemberInput): void
  (e: 'update-role', payload: { memberId: string; role: ProjectRole }): void
}>()

const newMemberName = ref('')
const newMemberEmail = ref('')
const newMemberRole = ref<InviteTeamMemberInput['role']>('editor')
const inviteError = ref('')

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
      <div class="col-12 col-md-7">
        <input v-model="newMemberEmail" type="email" class="form-control form-control-sm" placeholder="mitglied@beispiel.de" />
      </div>
      <div class="col-8 col-md-3">
        <select v-model="newMemberRole" class="form-select form-select-sm">
          <option value="editor">Editor</option>
          <option value="viewer">Viewer</option>
        </select>
      </div>
      <div class="col-4 col-md-2">
        <button type="button" class="btn btn-primary btn-sm w-100 d-inline-flex align-items-center justify-content-center gap-1" @click="submitMember">
          <Plus :size="14" />
          Hinzu
        </button>
      </div>
      <div v-if="inviteError" class="col-12">
        <p class="small text-danger mb-0">{{ inviteError }}</p>
      </div>
    </div>

    <div class="vstack gap-2">
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
  display: flex;
  align-items: center;
  gap: 0.7rem;
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
  flex: 1;
  min-width: 0;
}

.member-name {
  font-size: 0.95rem;
  font-weight: 600;
}

.member-mail {
  font-size: 0.83rem;
  color: var(--text-muted);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.member-role-select {
  width: 110px;
  flex-shrink: 0;
}

.role-badge {
  border-radius: 999px;
  font-size: 0.72rem;
  padding: 0.3rem 0.55rem;
}

.role-badge-owner {
  background: #eef3ff;
  color: #2a4ca0;
  border: 1px solid #cedbff;
}
</style>

