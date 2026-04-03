import type { TimelineEntry } from './types'

/**
 * Merges every `*.json` file in `./timeline/`.
 * Add a new file (e.g. `my_story.json`) — same array shape — and it loads automatically.
 */
const modules = import.meta.glob<{ default: TimelineEntry[] }>('./timeline/*.json', {
  eager: true,
})

function loadAll(): TimelineEntry[] {
  const out: TimelineEntry[] = []
  for (const path of Object.keys(modules)) {
    const mod = modules[path]
    if (!mod?.default) continue
    const chunk = mod.default as TimelineEntry[]
    if (!Array.isArray(chunk)) continue
    out.push(...chunk)
  }
  return out
}

export const TIMELINE_ENTRIES: TimelineEntry[] = loadAll()
