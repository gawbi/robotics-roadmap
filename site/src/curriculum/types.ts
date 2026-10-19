export interface Branch {
  id: string
  title: string
  summary: string
  color: string
  /** the foundations every other branch builds on; its chain is drawn as the graph's trunk */
  core: boolean
}

export interface Paper {
  title: string
  authors: string
  year: number
  url?: string
}

export interface Lesson {
  id: string
  title: string
  branch: string
  requires: string[]
  hours: number
  summary: string
  papers: Paper[]
  /** markdown body without frontmatter */
  body: string
  /** repo-relative path of the subject file */
  path: string
}

export interface Curriculum {
  branches: Branch[]
  lessons: Lesson[]
  byId: Map<string, Lesson>
  /** direct dependents: id -> ids that list it in `requires` */
  unlocks: Map<string, string[]>
}

export type Status = 'todo' | 'in_progress' | 'done'

/** status shown on the graph: learner-set status plus derived availability */
export type NodeState = 'done' | 'in_progress' | 'available' | 'locked'
