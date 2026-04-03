import type { LocaleCode } from '@/locale/types'
import type { TimelineEntry } from './types'

/**
 * Merges every `*.json` under `./timeline/<locale>/`.
 * Add a file in both `en` and `cs` (same ids) when introducing a new chunk.
 */
const enModules = import.meta.glob<{ default: TimelineEntry[] }>('./timeline/en/*.json', {
  eager: true,
})
const csModules = import.meta.glob<{ default: TimelineEntry[] }>('./timeline/cs/*.json', {
  eager: true,
})

function loadAll(
  modules: Record<string, { default: TimelineEntry[] }>,
): TimelineEntry[] {
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

const cache: Partial<Record<LocaleCode, TimelineEntry[]>> = {}

export function getTimelineEntries(locale: LocaleCode): TimelineEntry[] {
  const modules = locale === 'cs' ? csModules : enModules
  if (!cache[locale]) {
    cache[locale] = loadAll(modules)
  }
  return cache[locale]!
}
