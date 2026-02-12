<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import AppNavbar from '@/components/AppNavbar.vue'
import { useAuthStore } from '@/core/store/useAuthStore'
import { useProjectAccessStore } from '@/core/store/useProjectAccessStore'

interface TeamWorkspace {
  id: string
  name: string
  description: string
  membersCount: number
}

const authStore = useAuthStore()
const accessStore = useProjectAccessStore()

const displayName = ref(authStore.user?.name || '')
const profileEmail = ref(authStore.user?.email || '')
const avatarPreview = ref(authStore.user?.avatarUrl || '')
const infoSaved = ref(false)

const newTeamName = ref('')
const newTeamDescription = ref('')
const teamError = ref('')
const teams = ref<TeamWorkspace[]>([])

const teamsStorageKey = computed(() => {
  const userId = authStore.user?.id
  if (!userId) return null
  return `poster_designer_profile_teams_${userId}`
})

watch(
  teamsStorageKey,
  (storageKey) => {
    if (!storageKey) {
      teams.value = []
      return
    }
    const raw = window.localStorage.getItem(storageKey)
    if (!raw) {
      teams.value = []
      return
    }
    try {
      const parsed = JSON.parse(raw)
      teams.value = Array.isArray(parsed) ? parsed : []
    } catch {
      teams.value = []
    }
  },
  { immediate: true }
)

const linkedProjects = computed(() => {
  const email = authStore.user?.email?.trim().toLowerCase()
  if (!email) return []

  return Object.values(accessStore.byProjectId).filter((project) =>
    project.members.some((member) => member.email.trim().toLowerCase() === email)
  )
})

function persistTeams() {
  if (!teamsStorageKey.value) return
  window.localStorage.setItem(teamsStorageKey.value, JSON.stringify(teams.value))
}

function saveProfile() {
  authStore.updateProfile({
    name: displayName.value.trim(),
    email: profileEmail.value.trim().toLowerCase(),
    avatarUrl: avatarPreview.value || undefined
  })
  infoSaved.value = true
  setTimeout(() => {
    infoSaved.value = false
  }, 1400)
}

function onAvatarChange(event: Event) {
  const target = event.target as HTMLInputElement
  if (!target.files || !target.files[0]) return
  const file = target.files[0]
  const reader = new FileReader()
  reader.onload = (loadEvent) => {
    avatarPreview.value = (loadEvent.target?.result as string) || ''
  }
  reader.readAsDataURL(file)
  target.value = ''
}

function createTeam() {
  const teamName = newTeamName.value.trim()
  if (!teamName) {
    teamError.value = 'Teamname ist erforderlich.'
    return
  }
  teamError.value = ''
  teams.value.unshift({
    id: crypto.randomUUID(),
    name: teamName,
    description: newTeamDescription.value.trim(),
    membersCount: 1
  })
  newTeamName.value = ''
  newTeamDescription.value = ''
  persistTeams()
}
</script>

<template>
  <div class="profile-shell min-vh-100">
    <AppNavbar active-section="projects" context-label="Profil" />

    <main class="container-fluid px-3 px-lg-4 py-4">
      <div class="row g-4">
        <div class="col-12 col-xl-6">
          <section class="card border-0 shadow-sm h-100">
            <div class="card-body">
              <h1 class="h4 mb-2">Profil</h1>
              <p class="text-secondary mb-3">Persoenliche Daten und Profilbild verwalten.</p>

              <div class="d-flex align-items-center gap-3 mb-3">
                <div class="profile-avatar">
                  <img v-if="avatarPreview" :src="avatarPreview" alt="Avatar" />
                  <span v-else>{{ (displayName || 'U').slice(0, 1).toUpperCase() }}</span>
                </div>
                <div>
                  <label class="btn btn-outline-secondary btn-sm mb-0">
                    Profilbild hochladen
                    <input type="file" class="d-none" accept="image/*" @change="onAvatarChange" />
                  </label>
                </div>
              </div>

              <div class="vstack gap-2">
                <div>
                  <label class="form-label">Name</label>
                  <input v-model="displayName" type="text" class="form-control" />
                </div>
                <div>
                  <label class="form-label">E-Mail</label>
                  <input v-model="profileEmail" type="email" class="form-control" />
                </div>
              </div>

              <div class="mt-3 d-flex align-items-center gap-2">
                <button type="button" class="btn btn-primary" @click="saveProfile">Profil speichern</button>
                <span v-if="infoSaved" class="small text-success">Gespeichert</span>
              </div>
            </div>
          </section>
        </div>

        <div class="col-12 col-xl-6">
          <section class="card border-0 shadow-sm h-100">
            <div class="card-body">
              <h2 class="h5 mb-2">Teams</h2>
              <p class="text-secondary mb-3">Neue Teams erstellen und spaeter mit Projekten verknuepfen.</p>

              <div class="row g-2 mb-3">
                <div class="col-12">
                  <input v-model="newTeamName" type="text" class="form-control" placeholder="Teamname" />
                </div>
                <div class="col-12">
                  <input v-model="newTeamDescription" type="text" class="form-control" placeholder="Beschreibung (optional)" />
                </div>
                <div class="col-12">
                  <button type="button" class="btn btn-outline-primary w-100" @click="createTeam">Team erstellen</button>
                </div>
                <div v-if="teamError" class="col-12">
                  <p class="small text-danger mb-0">{{ teamError }}</p>
                </div>
              </div>

              <div class="vstack gap-2">
                <div v-if="teams.length === 0" class="small text-secondary">Noch keine Teams erstellt.</div>
                <article v-for="team in teams" :key="team.id" class="team-row">
                  <p class="fw-semibold mb-0">{{ team.name }}</p>
                  <p class="small text-secondary mb-0">{{ team.description || 'Ohne Beschreibung' }}</p>
                  <p class="small mb-0">{{ team.membersCount }} Mitglied(er)</p>
                </article>
              </div>
            </div>
          </section>
        </div>
      </div>

      <section class="card border-0 shadow-sm mt-4">
        <div class="card-body">
          <h2 class="h5 mb-2">Team-Zugriffe in Projekten</h2>
          <p class="text-secondary mb-3">Uebersicht der Projekte, in denen dein Account Mitglied ist.</p>

          <div v-if="linkedProjects.length === 0" class="small text-secondary">Keine zugewiesenen Projektzugriffe vorhanden.</div>
          <div v-else class="row g-3">
            <div v-for="project in linkedProjects" :key="project.projectId" class="col-12 col-md-6 col-xl-4">
              <article class="project-access-card">
                <p class="fw-semibold mb-1">Projekt {{ project.projectId.slice(0, 8) }}</p>
                <p class="small text-secondary mb-1">{{ project.members.length }} Teammitglieder</p>
                <p class="small text-secondary mb-0">{{ project.shareLinks.length }} Share-Links</p>
              </article>
            </div>
          </div>
        </div>
      </section>
    </main>
  </div>
</template>

<style scoped>
.profile-shell {
  background: #f3f4f6;
}

.profile-avatar {
  width: 72px;
  height: 72px;
  border-radius: 999px;
  border: 1px solid var(--panel-border);
  background: #eef2fb;
  overflow: hidden;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  color: #2b3d60;
}

.profile-avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.team-row {
  border: 1px solid var(--panel-border);
  border-radius: 0.75rem;
  padding: 0.65rem;
  background: #ffffff;
}

.project-access-card {
  border: 1px solid var(--panel-border);
  border-radius: 0.8rem;
  padding: 0.7rem;
  background: #ffffff;
}
</style>

