import type { TeamWorkspace } from '@/core/models/teamWorkspace'

const TEAM_STORAGE_KEY_PREFIX = 'poster_designer_profile_teams_'

interface LegacyTeamWorkspace {
  id: string
  name: string
  description?: string
  membersCount?: number
  memberEmails?: string[]
}

function normalizeEmail(email: string) {
  return email.trim().toLowerCase()
}

function normalizeTeamWorkspace(value: unknown, fallbackEmail?: string): TeamWorkspace | null {
  if (!value || typeof value !== 'object') return null
  const candidate = value as Partial<LegacyTeamWorkspace>
  if (typeof candidate.id !== 'string') return null
  if (typeof candidate.name !== 'string') return null

  const memberEmails = Array.isArray(candidate.memberEmails)
    ? candidate.memberEmails
        .filter((email): email is string => typeof email === 'string')
        .map((email) => normalizeEmail(email))
        .filter((email, index, values) => email.length > 0 && values.indexOf(email) === index)
    : []

  if (memberEmails.length === 0 && fallbackEmail) {
    memberEmails.push(normalizeEmail(fallbackEmail))
  }

  return {
    id: candidate.id,
    name: candidate.name.trim(),
    description: typeof candidate.description === 'string' ? candidate.description.trim() : '',
    memberEmails
  }
}

export function getTeamsStorageKey(userId: string) {
  return `${TEAM_STORAGE_KEY_PREFIX}${userId}`
}

export function readStoredTeamsForUser(userId: string, fallbackEmail?: string): TeamWorkspace[] {
  if (typeof window === 'undefined') return []
  const raw = window.localStorage.getItem(getTeamsStorageKey(userId))
  if (!raw) return []

  try {
    const parsed = JSON.parse(raw)
    if (!Array.isArray(parsed)) return []
    return parsed
      .map((entry) => normalizeTeamWorkspace(entry, fallbackEmail))
      .filter((entry): entry is TeamWorkspace => entry !== null)
  } catch {
    return []
  }
}

export function writeStoredTeamsForUser(userId: string, teams: TeamWorkspace[]) {
  if (typeof window === 'undefined') return
  window.localStorage.setItem(getTeamsStorageKey(userId), JSON.stringify(teams))
}
