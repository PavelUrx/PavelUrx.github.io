/** Categories for timeline filters — add kinds here and in filter UI. */
export type TimelineKind = 'github' | 'education' | 'employment' | 'contract'

export type TimelineEntry = {
  /** Stable id for keys and expand state (unique across all timeline JSON files). */
  id: string
  kind: TimelineKind
  /** Start month `YYYY-MM`. */
  start: string
  /** End `YYYY-MM`, or `null` if ongoing. */
  end: string | null
  title: string
  context: string
  /** Short line on the card. */
  summary: string
  href?: string | null
  /** Optional longer text when the user expands the entry (plain text; use \\n for line breaks). */
  details?: string | null
}

export type FocusArea = 'backend' | 'frontend' | 'networking' | 'devops' | 'data'

export type FocusItem = {
  label: string
  areas: FocusArea[]
}

export type FocusFile = {
  items: FocusItem[]
}
