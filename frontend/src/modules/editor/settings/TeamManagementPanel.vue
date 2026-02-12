<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useAuthStore } from '@/core/store/useAuthStore'
import { useEditorStore } from '@/core/store/useEditorStore'
import { useProjectAccessStore } from '@/core/store/useProjectAccessStore'
import type { InviteTeamMemberInput, ProjectRole, ShareLinkRole } from '@/core/models/accessControl'
import type { TeamWorkspace } from '@/core/models/teamWorkspace'
import { readStoredTeamsForUser } from '@/core/utils/teamWorkspaceStorage'
import TeamAccessSection from './TeamAccessSection.vue'

const editorStore = useEditorStore()
const authStore = useAuthStore()
const accessStore = useProjectAccessStore()

const activeProjectId = computed(() => editorStore.activePoster?.id || null)
const availableTeams = ref<TeamWorkspace[]>([])

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

watch(
  () => [authStore.user?.id, authStore.user?.email, activeProjectId.value],
  () => {
    const userId = authStore.user?.id
    if (!userId) {
      availableTeams.value = []
      return
    }
    availableTeams.value = readStoredTeamsForUser(userId, authStore.user?.email || undefined)
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

function addTeamAccess(payload: { teamId: string; role: ShareLinkRole }) {
  if (!activeProjectId.value) return
  const sourceTeam = availableTeams.value.find((entry) => entry.id === payload.teamId)
  if (!sourceTeam) return

  accessStore.addTeamAccess(activeProjectId.value, {
    teamId: sourceTeam.id,
    teamName: sourceTeam.name,
    role: payload.role,
    memberEmails: sourceTeam.memberEmails
  })
}

function updateTeamAccessRole(payload: { accessId: string; role: ShareLinkRole }) {
  if (!activeProjectId.value) return
  accessStore.updateTeamAccessRole(activeProjectId.value, payload.accessId, payload.role)
}

function removeTeamAccess(payload: { accessId: string }) {
  if (!activeProjectId.value) return
  accessStore.removeTeamAccess(activeProjectId.value, payload.accessId)
}
</script>

<template>
  <div class="vstack gap-3">
    <TeamAccessSection
      v-if="projectAccess"
      :members="projectAccess.members"
      :team-accesses="projectAccess.teamAccesses"
      :available-teams="availableTeams"
      @add-member="addMember"
      @update-role="updateRole"
      @add-team-access="addTeamAccess"
      @update-team-access-role="updateTeamAccessRole"
      @remove-team-access="removeTeamAccess"
    />
  </div>
</template>
