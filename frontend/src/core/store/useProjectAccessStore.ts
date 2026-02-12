import { defineStore } from 'pinia'
import { ref } from 'vue'
import {
  EDITOR_PERMISSION_DEFINITIONS,
  type EditorPermissionKey,
  type EditorPermissionState,
  type InviteTeamMemberInput,
  type ProjectAccessSettings,
  type ProjectRole,
  type ShareLink,
  type ShareLinkRole,
  type TeamMember
} from '@/core/models/accessControl'

interface EnsureProjectAccessInput {
  projectId: string
  ownerId: string
  ownerName: string
  ownerEmail: string
}

interface ShareLinkAccessResult {
  projectId: string
  role: ShareLinkRole
}

const ACCESS_STORAGE_KEY = 'poster_designer_project_access_v1'

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

function createSeedMembers(owner: EnsureProjectAccessInput): TeamMember[] {
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

function isProjectRole(value: unknown): value is ProjectRole {
  return value === 'owner' || value === 'editor' || value === 'viewer'
}

function isShareLinkRole(value: unknown): value is ShareLinkRole {
  return value === 'editor' || value === 'viewer'
}

function normalizeShareLink(value: unknown): ShareLink | null {
  if (!value || typeof value !== 'object') return null
  const candidate = value as Partial<ShareLink>
  if (typeof candidate.id !== 'string') return null
  if (typeof candidate.token !== 'string') return null
  if (!isShareLinkRole(candidate.role)) return null
  if (typeof candidate.isActive !== 'boolean') return null
  if (typeof candidate.createdAt !== 'string') return null
  if (typeof candidate.updatedAt !== 'string') return null

  return {
    id: candidate.id,
    token: candidate.token,
    role: candidate.role,
    isActive: candidate.isActive,
    createdAt: candidate.createdAt,
    updatedAt: candidate.updatedAt
  }
}

function normalizeAccessSettings(value: unknown): ProjectAccessSettings | null {
  if (!value || typeof value !== 'object') return null
  const candidate = value as Partial<ProjectAccessSettings>
  if (typeof candidate.projectId !== 'string') return null

  const members = Array.isArray(candidate.members)
    ? candidate.members.filter((member): member is TeamMember => {
        if (!member || typeof member !== 'object') return false
        const entry = member as Partial<TeamMember>
        return (
          typeof entry.id === 'string' &&
          typeof entry.name === 'string' &&
          typeof entry.email === 'string' &&
          isProjectRole(entry.role)
        )
      })
    : []

  if (members.length === 0) return null

  const defaultPermissions = createDefaultEditorPermissions()
  const permissions: EditorPermissionState = { ...defaultPermissions }
  if (candidate.editorPermissions && typeof candidate.editorPermissions === 'object') {
    const source = candidate.editorPermissions as Partial<EditorPermissionState>
    for (const key of Object.keys(defaultPermissions) as EditorPermissionKey[]) {
      if (typeof source[key] === 'boolean') {
        permissions[key] = source[key] as boolean
      }
    }
  }

  const shareLinks = Array.isArray(candidate.shareLinks)
    ? candidate.shareLinks.map((link) => normalizeShareLink(link)).filter((link): link is ShareLink => link !== null)
    : []

  return {
    projectId: candidate.projectId,
    members,
    editorPermissions: permissions,
    shareLinks,
    updatedAt: typeof candidate.updatedAt === 'string' ? candidate.updatedAt : new Date().toISOString()
  }
}

function readStoredAccess(): Record<string, ProjectAccessSettings> {
  if (typeof window === 'undefined') return {}
  const raw = window.localStorage.getItem(ACCESS_STORAGE_KEY)
  if (!raw) return {}

  try {
    const parsed = JSON.parse(raw)
    if (!parsed || typeof parsed !== 'object') return {}

    const normalized: Record<string, ProjectAccessSettings> = {}
    for (const [projectId, value] of Object.entries(parsed as Record<string, unknown>)) {
      const item = normalizeAccessSettings(value)
      if (item) normalized[projectId] = item
    }
    return normalized
  } catch {
    return {}
  }
}

function generateShareToken() {
  return crypto.randomUUID().replace(/-/g, '')
}

export const useProjectAccessStore = defineStore('projectAccess', () => {
  const byProjectId = ref<Record<string, ProjectAccessSettings>>(readStoredAccess())

  function persist() {
    if (typeof window === 'undefined') return
    window.localStorage.setItem(ACCESS_STORAGE_KEY, JSON.stringify(byProjectId.value))
  }

  function ensureProjectAccess(input: EnsureProjectAccessInput) {
    if (byProjectId.value[input.projectId]) return

    byProjectId.value[input.projectId] = {
      projectId: input.projectId,
      members: createSeedMembers(input),
      editorPermissions: createDefaultEditorPermissions(),
      shareLinks: [],
      updatedAt: new Date().toISOString()
    }
    persist()
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
    persist()
    return true
  }

  function updateMemberRole(projectId: string, memberId: string, role: ProjectRole) {
    const projectAccess = byProjectId.value[projectId]
    if (!projectAccess) return

    const member = projectAccess.members.find((entry) => entry.id === memberId)
    if (!member || member.role === 'owner') return

    member.role = role
    projectAccess.updatedAt = new Date().toISOString()
    persist()
  }

  function toggleEditorPermission(projectId: string, permissionKey: EditorPermissionKey, enabled: boolean) {
    const projectAccess = byProjectId.value[projectId]
    if (!projectAccess) return

    projectAccess.editorPermissions[permissionKey] = enabled
    projectAccess.updatedAt = new Date().toISOString()
    persist()
  }

  function createShareLink(projectId: string, role: ShareLinkRole) {
    const projectAccess = byProjectId.value[projectId]
    if (!projectAccess) return null

    const now = new Date().toISOString()
    const link: ShareLink = {
      id: crypto.randomUUID(),
      token: generateShareToken(),
      role,
      isActive: true,
      createdAt: now,
      updatedAt: now
    }
    projectAccess.shareLinks.unshift(link)
    projectAccess.updatedAt = now
    persist()
    return link
  }

  function updateShareLinkRole(projectId: string, linkId: string, role: ShareLinkRole) {
    const projectAccess = byProjectId.value[projectId]
    if (!projectAccess) return

    const link = projectAccess.shareLinks.find((entry) => entry.id === linkId)
    if (!link) return
    link.role = role
    link.updatedAt = new Date().toISOString()
    projectAccess.updatedAt = link.updatedAt
    persist()
  }

  function toggleShareLink(projectId: string, linkId: string, enabled: boolean) {
    const projectAccess = byProjectId.value[projectId]
    if (!projectAccess) return

    const link = projectAccess.shareLinks.find((entry) => entry.id === linkId)
    if (!link) return
    link.isActive = enabled
    link.updatedAt = new Date().toISOString()
    projectAccess.updatedAt = link.updatedAt
    persist()
  }

  function findAccessByToken(token: string): ShareLinkAccessResult | null {
    if (!token) return null
    for (const [projectId, access] of Object.entries(byProjectId.value)) {
      const link = access.shareLinks.find((entry) => entry.token === token && entry.isActive)
      if (link) {
        return { projectId, role: link.role }
      }
    }
    return null
  }

  function resolveProjectRole(projectId: string, userId?: string | null, email?: string | null): ProjectRole | null {
    const projectAccess = byProjectId.value[projectId]
    if (!projectAccess) return null

    const normalizedEmail = email?.trim().toLowerCase()
    const member = projectAccess.members.find((entry) => entry.id === userId || entry.email.trim().toLowerCase() === normalizedEmail)
    return member?.role || null
  }

  function canRolePerform(projectId: string, role: ProjectRole, permissionKey: EditorPermissionKey) {
    if (role === 'owner') return true
    if (role === 'viewer') return false
    const projectAccess = byProjectId.value[projectId]
    if (!projectAccess) return true
    return !!projectAccess.editorPermissions[permissionKey]
  }

  return {
    byProjectId,
    ensureProjectAccess,
    getProjectAccess,
    addMember,
    updateMemberRole,
    toggleEditorPermission,
    createShareLink,
    updateShareLinkRole,
    toggleShareLink,
    findAccessByToken,
    resolveProjectRole,
    canRolePerform,
    editorPermissionDefinitions: EDITOR_PERMISSION_DEFINITIONS
  }
})
