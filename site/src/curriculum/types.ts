export interface Branch {
  id: string
  title: string
  summary: string
  color: string
  /** the foundations every other branch builds on; its chain is drawn as the graph's trunk */
  core: boolean
}

/** One tree of the map: a group of branches that grows from the starting lesson in one direction. */
export interface Tree {
  id: string
  /** direction the tree grows from the centre of the map, degrees clockwise from up */
  angle: number
  /** its branches, laid side by side in this order, clockwise around the centre */
  branches: string[]
}

/** lessons/branches.yaml */
export interface MapSpec {
  /** branches whose lessons sit together at the centre */
  hub: string[]
  trees: Tree[]
  branches: Branch[]
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
  hub: string[]
  trees: Tree[]
  branches: Branch[]
  lessons: Lesson[]
  byId: Map<string, Lesson>
  /** direct dependents: id -> ids that list it in `requires` */
  unlocks: Map<string, string[]>
}

export type Status = 'todo' | 'in_progress' | 'done'

/** status shown on the graph: learner-set status plus derived availability */
export type NodeState = 'done' | 'in_progress' | 'available' | 'locked'
