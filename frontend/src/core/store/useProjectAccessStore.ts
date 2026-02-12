import { defineStore } from 'pinia'
import { ref } from 'vue'
import {
  EDITOR_PERMISSION_DEFINITIONS,
  type EditorPermissionKey,
  type EditorPermissionState,
  type InviteTeamMemberInput,
  type ProjectAccessSettings,
  type ProjectRole
} from '@/core/models/accessControl'

interface EnsureProjectAccessInput {
  projectId: string
  ownerId: string
  ownerName: string
  ownerEmail: string
}

function createDefaultEditorPermissions(): EditorPermissionState {
  return {
    editTextContent: true,
    editTypography: true,
    editColors: false,
    moveAndResizeElements: false,
    addNewElements: false,
    uploadOwnAssets: true,
    deleteElements: false,
    managePages: false
  }
}

function createSeedMembers(owner: EnsureProjectAccessInput): ProjectAccessSettings['members'] {
  return [
    {
      id: owner.ownerId,
      name: owner.ownerName,
      email: owner.ownerEmail,
      role: 'owner'
    },
    {
      id: 'member-editor-seed',
      name: 'Marcus Weber',
      email: 'marcus@th-koeln.de',
      role: 'editor'
    },
    {
      id: 'member-viewer-seed',
      name: 'Lisa Schmidt',
      email: 'lisa.s@th-koeln.de',
      role: 'viewer'
    }
  ]
}

export const useProjectAccessStore = defineStore('projectAccess', () => {
  const byProjectId = ref<Record<string, ProjectAccessSettings>>({})

  function ensureProjectAccess(input: EnsureProjectAccessInput) {
    if (byProjectId.value[input.projectId]) return

    byProjectId.value[input.projectId] = {
      projectId: input.projectId,
      members: createSeedMembers(input),
      editorPermissions: createDefaultEditorPermissions(),
      updatedAt: new Date().toISOString()
    }
  }

  function getProjectAccess(projectId: string): ProjectAccessSettings | null {
    return byProjectId.value[projectId] || null
  }

  function addMember(projectId: string, payload: InviteTeamMemberInput) {
    const projectAccess = byProjectId.value[projectId]
    if (!projectAccess) return false

    const normalizedEmail = payload.email.trim().toLowerCase()
    const alreadyExists = projectAccess.members.some((member) => member.email.trim().toLowerCase() === normalizedEmail)
    if (alreadyExists) return false

    projectAccess.members.push({
      id: crypto.randomUUID(),
      name: payload.name.trim(),
      email: normalizedEmail,
      role: payload.role
    })
    projectAccess.updatedAt = new Date().toISOString()
    return true
  }

  function updateMemberRole(projectId: string, memberId: string, role: ProjectRole) {
    const projectAccess = byProjectId.value[projectId]
    if (!projectAccess) return

    const member = projectAccess.members.find((entry) => entry.id === memberId)
    if (!member || member.role === 'owner') return

    member.role = role
    projectAccess.updatedAt = new Date().toISOString()
  }

  function toggleEditorPermission(projectId: string, permissionKey: EditorPermissionKey, enabled: boolean) {
    const projectAccess = byProjectId.value[projectId]
    if (!projectAccess) return

    projectAccess.editorPermissions[permissionKey] = enabled
    projectAccess.updatedAt = new Date().toISOString()
  }

  return {
    byProjectId,
    ensureProjectAccess,
    getProjectAccess,
    addMember,
    updateMemberRole,
    toggleEditorPermission,
    editorPermissionDefinitions: EDITOR_PERMISSION_DEFINITIONS
  }
})

