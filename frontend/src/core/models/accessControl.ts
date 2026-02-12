export type ProjectRole = 'owner' | 'editor' | 'viewer'

export type EditorPermissionCategory = 'content' | 'assets' | 'project'

export type EditorPermissionKey =
  | 'editTextContent'
  | 'editTypography'
  | 'editColors'
  | 'moveAndResizeElements'
  | 'addNewElements'
  | 'uploadOwnAssets'
  | 'deleteElements'
  | 'managePages'

export interface TeamMember {
  id: string
  name: string
  email: string
  role: ProjectRole
}

export interface InviteTeamMemberInput {
  name: string
  email: string
  role: Extract<ProjectRole, 'editor' | 'viewer'>
}

export type EditorPermissionState = Record<EditorPermissionKey, boolean>

export interface EditorPermissionDefinition {
  key: EditorPermissionKey
  category: EditorPermissionCategory
  title: string
  description: string
}

export interface ProjectAccessSettings {
  projectId: string
  members: TeamMember[]
  editorPermissions: EditorPermissionState
  updatedAt: string
}

export const EDITOR_PERMISSION_DEFINITIONS: EditorPermissionDefinition[] = [
  {
    key: 'editTextContent',
    category: 'content',
    title: 'Textinhalt aendern',
    description: 'Editoren duerfen Texte bearbeiten.'
  },
  {
    key: 'editTypography',
    category: 'content',
    title: 'Typografie anpassen',
    description: 'Schriftart, -gewicht und -groesse sind bearbeitbar.'
  },
  {
    key: 'editColors',
    category: 'content',
    title: 'Farben aendern',
    description: 'Text-, Hintergrund- und Farbflaechen koennen angepasst werden.'
  },
  {
    key: 'moveAndResizeElements',
    category: 'content',
    title: 'Position und Groesse',
    description: 'Elemente duerfen verschoben und skaliert werden.'
  },
  {
    key: 'addNewElements',
    category: 'assets',
    title: 'Neue Elemente hinzufuegen',
    description: 'Editoren koennen Text- und Bildelemente erstellen.'
  },
  {
    key: 'uploadOwnAssets',
    category: 'assets',
    title: 'Eigene Uploads',
    description: 'Editoren koennen eigene Bilder hochladen.'
  },
  {
    key: 'deleteElements',
    category: 'assets',
    title: 'Elemente loeschen',
    description: 'Editoren duerfen bestehende Ebenen entfernen.'
  },
  {
    key: 'managePages',
    category: 'project',
    title: 'Seiten verwalten',
    description: 'Editoren duerfen Seiten hinzufuegen und loeschen.'
  }
]

