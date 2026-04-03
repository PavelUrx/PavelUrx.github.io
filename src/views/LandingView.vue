<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import HeroThreeBackdrop from '../components/HeroThreeBackdrop.vue'

/** Edit this union when you add categories. */
type TimelineKind = 'github' | 'education' | 'employment' | 'contract'

type TimelineEntry = {
  kind: TimelineKind
  /** Start month `YYYY-MM` (sorting / display). */
  start: string
  /** End `YYYY-MM`, or `null` if ongoing. */
  end: string | null
  title: string
  /** Company, school, client, or repository context. */
  context: string
  summary: string
  href?: string
}

const TIMELINE_FILTERS: { kind: TimelineKind; label: string }[] = [
  { kind: 'github', label: 'GitHub projects' },
  { kind: 'education', label: 'Education' },
  { kind: 'employment', label: 'Jobs' },
  { kind: 'contract', label: 'Contracts / entrepreneur' },
]

/** Placeholder rows — replace with your history (keep `YYYY-MM` dates for sorting). */
const TIMELINE_ENTRIES: TimelineEntry[] = [
  {
    kind: 'employment',
    start: '2024-03',
    end: null,
    title: '[Current role title]',
    context: '[Company · Location or remote]',
    summary: '[What you ship, stack, team size, or domain — one or two lines.]',
  },
  {
    kind: 'github',
    start: '2023-01',
    end: null,
    title: '[Open source or public repo name]',
    context: 'GitHub',
    summary: '[Problem, tech, stars/users if it helps — placeholder.]',
    href: 'https://github.com/[you]/[repo]',
  },
  {
    kind: 'contract',
    start: '2022-06',
    end: '2024-02',
    title: '[Client or product] — freelance',
    context: '[Your business or “Independent”]',
    summary: '[Engagement type, outcome, technologies.]',
  },
  {
    kind: 'employment',
    start: '2020-09',
    end: '2022-05',
    title: '[Previous job title]',
    context: '[Company]',
    summary: '[Responsibilities, impact line — placeholder.]',
  },
  {
    kind: 'education',
    start: '2016-09',
    end: '2020-06',
    title: '[Degree or programme]',
    context: '[University or school]',
    summary: '[Focus, thesis, notable course — placeholder.]',
  },
  {
    kind: 'github',
    start: '2019-03',
    end: '2021-11',
    title: '[Older public project]',
    context: 'GitHub',
    summary: '[Short description — placeholder.]',
    href: 'https://github.com/[you]/[repo]',
  },
]

function parseMonth(s: string): number {
  const [y, m] = s.split('-').map((x) => Number(x))
  return new Date(y!, m! - 1, 1).getTime()
}

function endSortTime(e: TimelineEntry): number {
  if (e.end) return parseMonth(e.end)
  return Date.now()
}

function formatMonthLabel(ym: string): string {
  const [y, mo] = ym.split('-').map((x) => Number(x))
  const d = new Date(y!, mo! - 1, 1)
  return d.toLocaleDateString(undefined, { month: 'short', year: 'numeric' })
}

function formatRange(e: TimelineEntry): string {
  const a = formatMonthLabel(e.start)
  const b = e.end ? formatMonthLabel(e.end) : 'Present'
  return `${a} — ${b}`
}

/** Grouping year: completed items use end year; ongoing use current calendar year. */
function bucketYear(e: TimelineEntry): number {
  if (e.end) return Number(e.end.split('-')[0])
  return new Date().getFullYear()
}

/** Focus / skills — edit areas when you add domains. */
type FocusArea = 'backend' | 'frontend' | 'networking' | 'devops' | 'data'

type FocusItem = {
  /** One line shown in the pill. */
  label: string
  /** Item matches if any tag intersects the active filter set (when filters are on). */
  areas: FocusArea[]
}

const FOCUS_FILTERS: { area: FocusArea; label: string }[] = [
  { area: 'backend', label: 'Back-end' },
  { area: 'frontend', label: 'Front-end' },
  { area: 'networking', label: 'Networking' },
  { area: 'devops', label: 'DevOps & infra' },
  { area: 'data', label: 'Data' },
]

const FOCUS_ITEMS: FocusItem[] = [
  { label: 'TypeScript, Node, HTTP APIs', areas: ['backend', 'frontend'] },
  { label: 'Vue, Vite, responsive UI', areas: ['frontend'] },
  { label: 'WebSockets, TCP/IP, real-time sync', areas: ['networking', 'backend'] },
  { label: 'Docker, CI/CD, cloud deploy', areas: ['devops', 'backend'] },
  { label: 'PostgreSQL, querying, migrations', areas: ['data', 'backend'] },
  { label: 'Rust / systems-leaning services', areas: ['backend'] },
  { label: 'Design systems, a11y, UX polish', areas: ['frontend'] },
  { label: 'Metrics, logs, reliability', areas: ['devops', 'data'] },
]

/** When empty, every kind is shown; otherwise OR across selected kinds. */
const activeFilterKinds = ref<Set<TimelineKind>>(new Set())

function toggleFilter(kind: TimelineKind) {
  const next = new Set(activeFilterKinds.value)
  if (next.has(kind)) next.delete(kind)
  else next.add(kind)
  activeFilterKinds.value = next
}

const kindLabel = (kind: TimelineKind) =>
  TIMELINE_FILTERS.find((x) => x.kind === kind)?.label ?? kind

/** Focus: no chip selected → show all; OR across selected areas. */
const activeFocusAreas = ref<Set<FocusArea>>(new Set())

function toggleFocusFilter(area: FocusArea) {
  const next = new Set(activeFocusAreas.value)
  if (next.has(area)) next.delete(area)
  else next.add(area)
  activeFocusAreas.value = next
}

const visibleFocusItems = computed(() => {
  if (activeFocusAreas.value.size === 0) return FOCUS_ITEMS
  return FOCUS_ITEMS.filter((item) =>
    item.areas.some((a) => activeFocusAreas.value.has(a)),
  )
})

const visibleTimeline = computed(() => {
  let list = [...TIMELINE_ENTRIES]
  if (activeFilterKinds.value.size > 0) {
    list = list.filter((e) => activeFilterKinds.value.has(e.kind))
  }
  list.sort((a, b) => {
    const diff = endSortTime(b) - endSortTime(a)
    if (diff !== 0) return diff
    return parseMonth(b.start) - parseMonth(a.start)
  })
  return list
})

type YearCluster = { year: number; entries: TimelineEntry[] }

const groupedTimeline = computed((): YearCluster[] => {
  const map = new Map<number, TimelineEntry[]>()
  for (const e of visibleTimeline.value) {
    const y = bucketYear(e)
    const arr = map.get(y)
    if (arr) arr.push(e)
    else map.set(y, [e])
  }
  return [...map.entries()]
    .sort((a, b) => b[0] - a[0])
    .map(([year, entries]) => ({ year, entries }))
})

const timelineBoardEl = ref<HTMLElement | null>(null)
let boardIo: IntersectionObserver | null = null
let rowIo: IntersectionObserver | null = null

function disconnectTimelineObservers() {
  boardIo?.disconnect()
  boardIo = null
  rowIo?.disconnect()
  rowIo = null
}

function bindTimelineReveal() {
  disconnectTimelineObservers()
  const root = timelineBoardEl.value
  if (!root) return

  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  if (reduceMotion) {
    root.classList.add('timeline-board--cue')
    root.querySelectorAll('.timeline-year-row').forEach((el) => {
      el.classList.add('timeline-year-row--inview')
    })
    return
  }

  if (!root.classList.contains('timeline-board--cue')) {
    boardIo = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting && e.target === root) {
            root.classList.add('timeline-board--cue')
            boardIo?.disconnect()
            boardIo = null
            break
          }
        }
      },
      { threshold: 0.06, rootMargin: '0px 0px 12% 0px' },
    )
    boardIo.observe(root)
  }

  const rows = root.querySelectorAll('.timeline-year-row')
  if (rows.length === 0) return

  rowIo = new IntersectionObserver(
    (entries) => {
      for (const e of entries) {
        if (e.isIntersecting) {
          e.target.classList.add('timeline-year-row--inview')
          rowIo?.unobserve(e.target)
        }
      }
    },
    { threshold: 0.08, rootMargin: '0px 0px -6% 0px' },
  )
  rows.forEach((el) => rowIo!.observe(el))
}

watch(groupedTimeline, () => {
  void nextTick(() => {
    bindTimelineReveal()
  })
}, { flush: 'post' })

onMounted(() => {
  void nextTick(() => {
    bindTimelineReveal()
  })
})

onBeforeUnmount(() => {
  disconnectTimelineObservers()
})
</script>

<template>
  <main class="landing">
    <div class="backdrop-layer" aria-hidden="true">
      <HeroThreeBackdrop />
    </div>

    <section class="hero" aria-label="Introduction">
      <h1 class="title">Pavel Urx</h1>
      <p class="role">[Your role — e.g. Full-stack developer]</p>
      <p class="tagline">
        [One line: what you build, who you help, or the problems you like solving.]
      </p>
    </section>

    <div class="content">
      <section class="block" aria-labelledby="about-heading">
        <h2 id="about-heading" class="block-heading">About</h2>
        <p class="block-text">
          [2–3 sentences: background, what you care about in engineering or design, and what you’re
          looking for next — clients, collaborators, or a full-time role.]
        </p>
      </section>

      <section class="block" aria-labelledby="timeline-heading">
        <h2 id="timeline-heading" class="block-heading">Timeline</h2>
        <p class="timeline-hint" id="timeline-filters-label">
          Narrow by category — leave all off to show everything.
        </p>
        <div
          class="timeline-filters"
          role="group"
          aria-labelledby="timeline-filters-label"
        >
          <button
            v-for="f in TIMELINE_FILTERS"
            :key="f.kind"
            type="button"
            class="filter-chip"
            :data-timeline-kind="f.kind"
            :class="{ 'filter-chip--on': activeFilterKinds.has(f.kind) }"
            :aria-pressed="activeFilterKinds.has(f.kind)"
            @click="toggleFilter(f.kind)"
          >
            {{ f.label }}
          </button>
        </div>

        <div ref="timelineBoardEl" class="timeline-board" aria-live="polite">
          <div class="timeline-scale" aria-hidden="true">
            <span class="timeline-scale-mark" />
            <span class="timeline-scale-text">Temporal scale</span>
            <span class="timeline-scale-unit">years · newest ↑</span>
            <span class="timeline-scale-mark timeline-scale-mark--end" />
          </div>

          <p v-if="visibleTimeline.length === 0" class="timeline-empty">
            No entries for this filter. Toggle a category or clear filters.
          </p>

          <div v-else class="timeline-shell">
            <div class="timeline-shell-track" aria-hidden="true" />

            <div
              v-for="(cluster, cidx) in groupedTimeline"
              :key="cluster.year"
              class="timeline-year-row"
              :data-accent="cidx % 3"
              :style="{ '--cluster-idx': cidx }"
            >
              <aside class="timeline-cluster-rail" aria-hidden="true">
                <span class="timeline-rail-node">
                  <span class="timeline-rail-tick-dot" />
                  <span class="timeline-rail-tick-year">{{ cluster.year }}</span>
                </span>
              </aside>

              <div class="timeline-year-cluster" :data-accent="cidx % 3">
                <header class="timeline-year-cluster-head">
                  <time class="timeline-year-display" :datetime="String(cluster.year)">
                    {{ cluster.year }}
                  </time>
                  <span class="timeline-year-unit">yr</span>
                  <span class="timeline-year-glitch" aria-hidden="true">{{ cluster.year }}</span>
                </header>

                <ul class="timeline-card-list">
                  <li
                    v-for="(entry, j) in cluster.entries"
                    :key="`${entry.kind}-${entry.start}-${entry.title}`"
                    class="timeline-card"
                    :data-kind="entry.kind"
                    :style="{ '--stagger': j }"
                  >
                    <div class="timeline-card-inner">
                      <div class="timeline-card-top">
                        <span class="timeline-card-kind">{{ kindLabel(entry.kind) }}</span>
                        <span class="timeline-card-span">{{ formatRange(entry) }}</span>
                      </div>
                      <h3 class="timeline-card-title">
                        <a
                          v-if="entry.href"
                          :href="entry.href"
                          class="timeline-link"
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          {{ entry.title }}
                        </a>
                        <template v-else>{{ entry.title }}</template>
                      </h3>
                      <p class="timeline-card-context">{{ entry.context }}</p>
                      <p class="timeline-card-summary">{{ entry.summary }}</p>
                    </div>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section class="block" aria-labelledby="focus-heading">
        <h2 id="focus-heading" class="block-heading">Focus</h2>
        <p class="timeline-hint" id="focus-filters-label">
          Narrow by area — leave all off to show everything.
        </p>
        <div
          class="timeline-filters"
          role="group"
          aria-labelledby="focus-filters-label"
        >
          <button
            v-for="f in FOCUS_FILTERS"
            :key="f.area"
            type="button"
            class="filter-chip"
            :data-focus-area="f.area"
            :class="{ 'filter-chip--on': activeFocusAreas.has(f.area) }"
            :aria-pressed="activeFocusAreas.has(f.area)"
            @click="toggleFocusFilter(f.area)"
          >
            {{ f.label }}
          </button>
        </div>

        <p v-if="visibleFocusItems.length === 0" class="timeline-empty" aria-live="polite">
          No skills match this filter. Turn off a category to see more.
        </p>
        <ul v-else class="focus-tech" aria-label="Skills and technologies">
          <li
            v-for="(item, i) in visibleFocusItems"
            :key="`${item.label}-${i}`"
            class="focus-tech-item"
            :data-primary-area="item.areas[0] ?? 'backend'"
          >
            <span class="focus-tech-label">{{ item.label }}</span>
          </li>
        </ul>
      </section>

      <section class="block" aria-labelledby="contact-heading">
        <h2 id="contact-heading" class="block-heading">Contact</h2>
        <ul class="contact-list">
          <li>
            <span class="contact-label">Email</span>
            <span class="contact-value">[you@example.com]</span>
          </li>
          <li>
            <span class="contact-label">GitHub</span>
            <span class="contact-value">[github.com/yourusername]</span>
          </li>
          <li>
            <span class="contact-label">LinkedIn</span>
            <span class="contact-value">[linkedin.com/in/yourprofile]</span>
          </li>
          <li>
            <span class="contact-label">Location</span>
            <span class="contact-value">[City, country — or Remote / Hybrid]</span>
          </li>
        </ul>
      </section>
    </div>
  </main>
</template>

<style scoped>
.landing {
  position: relative;
  isolation: isolate;
  min-height: 100dvh;
  display: flex;
  flex-direction: column;
  align-items: stretch;
  text-align: center;
  overflow-x: hidden;
}

.backdrop-layer {
  position: fixed;
  inset: 0;
  z-index: 0;
  pointer-events: none;
}

.landing::before {
  content: '';
  position: absolute;
  inset: 0;
  z-index: 1;
  min-height: 100%;
  background:
    radial-gradient(ellipse 68% 52% at 48% 44%, var(--color-glow-blue), transparent 60%),
    radial-gradient(ellipse 48% 42% at 74% 16%, var(--color-glow-pink), transparent 52%),
    radial-gradient(ellipse 38% 48% at 14% 78%, var(--color-glow-violet), transparent 55%);
  pointer-events: none;
  opacity: 0.88;
}

.hero {
  position: relative;
  z-index: 2;
  flex: 0 0 auto;
  min-height: 100dvh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: clamp(0.45rem, 1.8vh, 1rem);
  padding: clamp(1rem, 5vmin, 2.5rem);
}

.content {
  position: relative;
  z-index: 2;
  width: 100%;
  max-width: min(92vw, clamp(20rem, 52vw + 12rem, 52rem));
  margin: 0 auto;
  padding: clamp(1.25rem, 4vmin, 2.25rem) clamp(1rem, 3.5vw + 0.35rem, 3rem)
    clamp(2.5rem, 8vmin, 4.25rem);
  text-align: left;
  border-top: 1px solid rgba(12, 235, 255, 0.14);
  background: linear-gradient(180deg, rgba(5, 5, 20, 0.42) 0%, rgba(5, 5, 20, 0.28) 100%);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
}

/* Blur + fixed WebGL under a scrolling layer is very expensive on mobile GPUs (incl. landscape). */
@media (max-width: 1024px), ((hover: none) and (pointer: coarse)) {
  .content {
    backdrop-filter: none;
    -webkit-backdrop-filter: none;
    background: linear-gradient(180deg, rgba(5, 5, 20, 0.92) 0%, rgba(5, 5, 20, 0.82) 100%);
  }
}

.title {
  position: relative;
  z-index: 1;
  font-family: var(--font-display);
  font-size: clamp(1.5rem, 5.5vmin, 2.75rem);
  font-weight: 400;
  line-height: 1.2;
  letter-spacing: 0.06em;
  color: var(--color-heading);
  text-shadow:
    0 0 22px rgba(12, 235, 255, 0.5),
    0 0 40px rgba(255, 64, 208, 0.32),
    0 0 72px rgba(176, 102, 255, 0.3),
    0 1px 0 rgba(0, 0, 0, 0.5);
}

.title::after {
  content: '';
  display: block;
  width: clamp(2.75rem, 12vmin, 4.5rem);
  height: 2px;
  margin: clamp(0.55rem, 2vmin, 0.85rem) auto 0;
  background: linear-gradient(
    90deg,
    transparent,
    var(--neo-blue) 22%,
    var(--neo-violet) 50%,
    var(--neo-pink) 78%,
    transparent
  );
  border-radius: 2px;
  box-shadow:
    0 0 14px rgba(12, 235, 255, 0.55),
    0 0 26px rgba(255, 64, 208, 0.35);
}

.role {
  position: relative;
  z-index: 1;
  margin: 0;
  font-family: var(--font-mono);
  font-size: clamp(0.78rem, 2vmin, 0.9rem);
  font-weight: 600;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: rgba(200, 220, 255, 0.72);
}

.tagline {
  position: relative;
  z-index: 1;
  margin: 0;
  font-family: var(--font-mono);
  font-size: clamp(0.8rem, 2.1vmin, 0.95rem);
  font-weight: 400;
  line-height: 1.55;
  letter-spacing: 0.04em;
  color: var(--color-text-muted);
  max-width: 38ch;
  text-wrap: balance;
}

.block {
  margin-bottom: clamp(1.75rem, 5vmin, 2.5rem);
}

.block:last-child {
  margin-bottom: 0;
}

.block-heading {
  margin: 0 0 0.65rem;
  font-family: var(--font-display);
  font-size: clamp(0.7rem, 1.85vmin, 0.8rem);
  font-weight: 400;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: rgba(238, 246, 255, 0.9);
}

.block-heading::after {
  content: '';
  display: block;
  width: 2.25rem;
  height: 1px;
  margin-top: 0.5rem;
  background: linear-gradient(90deg, var(--neo-blue), transparent);
  opacity: 0.85;
}

.block-text {
  margin: 0;
  font-size: 0.92rem;
  line-height: 1.65;
  color: var(--color-text-muted);
  text-shadow: 0 1px 14px rgba(5, 5, 20, 0.85);
}

.timeline-hint {
  margin: 0 0 0.75rem;
  font-size: 0.78rem;
  line-height: 1.5;
  letter-spacing: 0.03em;
  color: rgba(175, 200, 255, 0.45);
  text-shadow: 0 1px 12px rgba(5, 5, 20, 0.85);
}

.timeline-filters {
  display: flex;
  flex-wrap: wrap;
  gap: 0.45rem 0.5rem;
  margin-bottom: 1.25rem;
}

/* Filter toggles: compact caps, squared — reads as controls, not content tags. */
.filter-chip {
  margin: 0;
  padding: 0.4rem 0.62rem;
  font-family: var(--font-display);
  font-size: 0.6rem;
  font-weight: 400;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: rgba(175, 200, 255, 0.72);
  background: rgba(5, 8, 20, 0.55);
  border: 1px solid rgba(12, 235, 255, 0.22);
  border-radius: 6px;
  cursor: pointer;
  transition:
    border-color 0.15s ease,
    background 0.15s ease,
    color 0.15s ease,
    box-shadow 0.15s ease;
}

.filter-chip:hover {
  border-color: rgba(12, 235, 255, 0.42);
  color: rgba(236, 244, 255, 0.92);
}

.filter-chip:focus-visible {
  outline: 2px solid rgba(12, 235, 255, 0.55);
  outline-offset: 2px;
}

/* Active filter: tint matches timeline kind / focus area. */
.filter-chip.filter-chip--on {
  color: rgba(248, 250, 255, 0.98);
}

.filter-chip[data-timeline-kind='github'].filter-chip--on {
  border-color: color-mix(in srgb, var(--neo-blue) 52%, rgba(255, 255, 255, 0.18));
  background: color-mix(in srgb, var(--neo-blue) 14%, rgba(5, 8, 20, 0.92));
  box-shadow:
    inset 0 1px 0 rgba(255, 255, 255, 0.06),
    0 0 22px color-mix(in srgb, var(--neo-blue) 24%, transparent);
}

.filter-chip[data-timeline-kind='education'].filter-chip--on {
  border-color: color-mix(in srgb, var(--neo-violet) 52%, rgba(255, 255, 255, 0.18));
  background: color-mix(in srgb, var(--neo-violet) 14%, rgba(5, 8, 20, 0.92));
  box-shadow:
    inset 0 1px 0 rgba(255, 255, 255, 0.06),
    0 0 22px color-mix(in srgb, var(--neo-violet) 24%, transparent);
}

.filter-chip[data-timeline-kind='employment'].filter-chip--on {
  border-color: color-mix(in srgb, rgb(130, 220, 255) 52%, rgba(255, 255, 255, 0.16));
  background: color-mix(in srgb, rgb(130, 220, 255) 13%, rgba(5, 8, 20, 0.92));
  box-shadow:
    inset 0 1px 0 rgba(255, 255, 255, 0.06),
    0 0 22px color-mix(in srgb, rgb(130, 220, 255) 22%, transparent);
}

.filter-chip[data-timeline-kind='contract'].filter-chip--on {
  border-color: color-mix(in srgb, var(--neo-pink) 52%, rgba(255, 255, 255, 0.18));
  background: color-mix(in srgb, var(--neo-pink) 14%, rgba(5, 8, 20, 0.92));
  box-shadow:
    inset 0 1px 0 rgba(255, 255, 255, 0.06),
    0 0 22px color-mix(in srgb, var(--neo-pink) 24%, transparent);
}

.filter-chip[data-focus-area='backend'].filter-chip--on {
  border-color: color-mix(in srgb, var(--neo-blue) 52%, rgba(255, 255, 255, 0.18));
  background: color-mix(in srgb, var(--neo-blue) 14%, rgba(5, 8, 20, 0.92));
  box-shadow:
    inset 0 1px 0 rgba(255, 255, 255, 0.06),
    0 0 22px color-mix(in srgb, var(--neo-blue) 24%, transparent);
}

.filter-chip[data-focus-area='frontend'].filter-chip--on {
  border-color: color-mix(in srgb, var(--neo-violet) 52%, rgba(255, 255, 255, 0.18));
  background: color-mix(in srgb, var(--neo-violet) 14%, rgba(5, 8, 20, 0.92));
  box-shadow:
    inset 0 1px 0 rgba(255, 255, 255, 0.06),
    0 0 22px color-mix(in srgb, var(--neo-violet) 24%, transparent);
}

.filter-chip[data-focus-area='networking'].filter-chip--on {
  border-color: color-mix(in srgb, rgb(100, 210, 255) 50%, rgba(255, 255, 255, 0.14));
  background: color-mix(in srgb, rgb(100, 210, 255) 12%, rgba(5, 8, 20, 0.92));
  box-shadow:
    inset 0 1px 0 rgba(255, 255, 255, 0.06),
    0 0 22px color-mix(in srgb, rgb(100, 210, 255) 20%, transparent);
}

.filter-chip[data-focus-area='devops'].filter-chip--on {
  border-color: color-mix(in srgb, var(--neo-pink) 52%, rgba(255, 255, 255, 0.18));
  background: color-mix(in srgb, var(--neo-pink) 14%, rgba(5, 8, 20, 0.92));
  box-shadow:
    inset 0 1px 0 rgba(255, 255, 255, 0.06),
    0 0 22px color-mix(in srgb, var(--neo-pink) 24%, transparent);
}

.filter-chip[data-focus-area='data'].filter-chip--on {
  border-color: color-mix(in srgb, var(--neo-fuchsia) 50%, rgba(255, 255, 255, 0.16));
  background: color-mix(in srgb, var(--neo-fuchsia) 13%, rgba(5, 8, 20, 0.92));
  box-shadow:
    inset 0 1px 0 rgba(255, 255, 255, 0.06),
    0 0 22px color-mix(in srgb, var(--neo-fuchsia) 22%, transparent);
}

.timeline-board {
  position: relative;
  padding: 0;
}

.timeline-scale {
  display: flex;
  align-items: center;
  gap: 0.55rem;
  flex-wrap: wrap;
  margin: 0 0 0.85rem;
}

.timeline-board:not(.timeline-board--cue) .timeline-scale-mark {
  transform: scaleX(0.08);
  opacity: 0.25;
  transition: none;
}

.timeline-board--cue .timeline-scale-mark {
  animation: timeline-scale-sweep 0.75s cubic-bezier(0.22, 1, 0.36, 1) backwards;
}

.timeline-board--cue .timeline-scale-mark:first-of-type {
  animation-delay: 0.06s;
  transform-origin: 100% 50%;
}

.timeline-board--cue .timeline-scale-mark--end {
  animation-delay: 0.12s;
  transform-origin: 0 50%;
}

.timeline-scale-mark {
  flex: 1;
  height: 1px;
  min-width: 1.5rem;
  background: linear-gradient(90deg, transparent, rgba(12, 235, 255, 0.35), transparent);
  opacity: 0.85;
}

.timeline-scale-mark--end {
  flex: 1.35;
}

.timeline-board:not(.timeline-board--cue) .timeline-scale-text,
.timeline-board:not(.timeline-board--cue) .timeline-scale-unit {
  opacity: 0;
  transform: translateY(6px);
}

.timeline-board--cue .timeline-scale-text {
  animation: timeline-soft-rise 0.55s cubic-bezier(0.22, 1, 0.36, 1) 0.18s backwards;
}

.timeline-board--cue .timeline-scale-unit {
  animation: timeline-soft-rise 0.55s cubic-bezier(0.22, 1, 0.36, 1) 0.28s backwards;
}

.timeline-scale-text {
  font-family: var(--font-display);
  font-size: 0.62rem;
  letter-spacing: 0.22em;
  text-transform: uppercase;
  color: rgba(238, 246, 255, 0.72);
}

.timeline-scale-unit {
  font-family: var(--font-mono);
  font-size: 0.63rem;
  letter-spacing: 0.08em;
  color: rgba(255, 64, 208, 0.55);
}

.timeline-shell {
  position: relative;
  display: flex;
  flex-direction: column;
  gap: clamp(1.5rem, 4vmin, 2.35rem);
  padding-bottom: 0.35rem;
  z-index: 1;
}

.timeline-shell-track {
  position: absolute;
  left: 2.5rem;
  top: 0.85rem;
  bottom: 0.65rem;
  width: 2px;
  transform: translateX(-50%) scaleY(0.04);
  transform-origin: top center;
  border-radius: 999px;
  background: linear-gradient(
    180deg,
    rgba(12, 235, 255, 0.5),
    rgba(176, 102, 255, 0.38) 42%,
    rgba(255, 64, 208, 0.3) 100%
  );
  box-shadow: 0 0 20px rgba(12, 235, 255, 0.18);
  pointer-events: none;
  opacity: 0.35;
}

.timeline-board--cue .timeline-shell-track {
  animation: timeline-track-reveal 0.95s cubic-bezier(0.22, 1, 0.36, 1) 0.2s forwards;
}

.timeline-year-row {
  display: grid;
  grid-template-columns: 5rem minmax(0, 1fr);
  gap: clamp(0.65rem, 2.5vw, 1.15rem);
  align-items: start;
}

.timeline-year-row[data-accent='0'] {
  --rail-glow: rgba(12, 235, 255, 0.45);
}
.timeline-year-row[data-accent='1'] {
  --rail-glow: rgba(176, 102, 255, 0.5);
}
.timeline-year-row[data-accent='2'] {
  --rail-glow: rgba(255, 64, 208, 0.42);
}

.timeline-cluster-rail {
  position: relative;
  display: flex;
  justify-content: center;
  padding-top: 0.45rem;
  z-index: 1;
}

.timeline-rail-node {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.28rem;
  text-align: center;
}

.timeline-rail-tick-dot {
  width: 0.62rem;
  height: 0.62rem;
  border-radius: 50%;
  border: 2px solid var(--rail-glow);
  background: radial-gradient(circle at 35% 28%, var(--rail-glow), rgba(5, 5, 20, 0.92));
  box-shadow: 0 0 14px var(--rail-glow);
}

.timeline-rail-tick-year {
  font-family: var(--font-display);
  font-size: clamp(0.64rem, 1.7vw, 0.74rem);
  letter-spacing: 0.1em;
  color: rgba(238, 246, 255, 0.88);
  text-shadow: 0 0 18px var(--rail-glow);
}

.timeline-year-cluster {
  --cluster-accent: rgba(12, 235, 255, 0.65);
}

.timeline-year-cluster[data-accent='1'] {
  --cluster-accent: rgba(176, 102, 255, 0.7);
}

.timeline-year-cluster[data-accent='2'] {
  --cluster-accent: rgba(255, 64, 208, 0.62);
}

.timeline-year-cluster-head {
  position: relative;
  display: flex;
  align-items: baseline;
  gap: 0.35rem;
  margin-bottom: 0.65rem;
  padding-left: 0.15rem;
}

.timeline-year-row:not(.timeline-year-row--inview) .timeline-cluster-rail,
.timeline-year-row:not(.timeline-year-row--inview) .timeline-year-cluster-head,
.timeline-year-row:not(.timeline-year-row--inview) .timeline-card {
  opacity: 0;
  pointer-events: none;
}

.timeline-year-row--inview .timeline-cluster-rail {
  animation: timeline-rail-pop 0.58s cubic-bezier(0.34, 1.3, 0.64, 1) backwards;
  animation-delay: calc(0.04s * var(--cluster-idx));
}

.timeline-year-row--inview .timeline-year-cluster-head {
  animation: timeline-head-slide 0.6s cubic-bezier(0.22, 1, 0.36, 1) backwards;
  animation-delay: calc(0.06s + 0.04s * var(--cluster-idx));
}

.timeline-year-row--inview .timeline-year-glitch {
  animation: timeline-glitch-fade 0.85s ease-out calc(0.1s + 0.04s * var(--cluster-idx)) backwards;
}

.timeline-year-display {
  margin: 0;
  font-family: var(--font-display);
  font-size: clamp(1.65rem, 5vw, 2.35rem);
  font-weight: 400;
  letter-spacing: 0.14em;
  line-height: 1;
  background: linear-gradient(105deg, var(--neo-blue), var(--neo-violet) 48%, var(--neo-pink));
  background-clip: text;
  -webkit-background-clip: text;
  color: transparent;
  filter: drop-shadow(0 0 22px rgba(12, 235, 255, 0.22));
}

.timeline-year-unit {
  font-family: var(--font-mono);
  font-size: 0.62rem;
  font-weight: 600;
  letter-spacing: 0.16em;
  color: rgba(175, 200, 255, 0.38);
  text-transform: uppercase;
  translate: 0 -0.15em;
}

.timeline-year-glitch {
  margin-left: auto;
  font-family: var(--font-display);
  font-size: clamp(1.8rem, 6vw, 2.75rem);
  letter-spacing: 0.2em;
  line-height: 0;
  color: transparent;
  -webkit-text-stroke: 1px rgba(12, 235, 255, 0.12);
  opacity: 0.35;
  user-select: none;
  pointer-events: none;
}

.timeline-card-list {
  margin: 0;
  padding: 0;
  list-style: none;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

/* Focus tech tags: colour by primary area (first tag in `areas`). */
.focus-tech-item {
  --focus-accent: var(--neo-blue);
  margin: 0;
  display: inline-flex;
  align-items: stretch;
  max-width: 100%;
  border-radius: 8px;
  background: linear-gradient(
    165deg,
    color-mix(in srgb, var(--focus-accent) 7%, rgba(14, 18, 38)),
    rgba(7, 10, 26, 0.82)
  );
  border: 1px solid color-mix(in srgb, var(--focus-accent) 22%, rgba(12, 235, 255, 0.08));
  border-left: 3px solid color-mix(in srgb, var(--focus-accent) 50%, rgba(12, 235, 255, 0.2));
  box-shadow:
    0 4px 18px rgba(0, 0, 0, 0.2),
    inset 0 1px 0 rgba(255, 255, 255, 0.03),
    0 0 16px color-mix(in srgb, var(--focus-accent) 7%, transparent);
  transition:
    transform 0.25s cubic-bezier(0.22, 1, 0.36, 1),
    box-shadow 0.25s ease,
    border-color 0.25s ease;
}

.focus-tech-item[data-primary-area='backend'] {
  --focus-accent: var(--neo-blue);
}

.focus-tech-item[data-primary-area='frontend'] {
  --focus-accent: var(--neo-violet);
}

.focus-tech-item[data-primary-area='networking'] {
  --focus-accent: rgb(100, 210, 255);
}

.focus-tech-item[data-primary-area='devops'] {
  --focus-accent: var(--neo-pink);
}

.focus-tech-item[data-primary-area='data'] {
  --focus-accent: var(--neo-fuchsia);
}

@media (hover: hover) and (pointer: fine) {
  .focus-tech-item:hover {
    transform: translateY(-2px);
    border-color: color-mix(in srgb, var(--focus-accent) 30%, rgba(12, 235, 255, 0.12));
    border-left-color: color-mix(in srgb, var(--focus-accent) 58%, rgba(12, 235, 255, 0.25));
    box-shadow:
      0 8px 22px rgba(0, 0, 0, 0.26),
      inset 0 1px 0 rgba(255, 255, 255, 0.04),
      0 0 24px color-mix(in srgb, var(--focus-accent) 16%, transparent);
  }
}

/* Timeline entries: shell tinted by entry kind (matches --card-accent). */
.timeline-card {
  position: relative;
  --stagger: 0;
  border-radius: 8px;
  background: linear-gradient(
    165deg,
    color-mix(in srgb, var(--card-accent) 7%, rgba(14, 18, 38)),
    rgba(7, 10, 26, 0.82)
  );
  border: 1px solid color-mix(in srgb, var(--card-accent) 22%, rgba(12, 235, 255, 0.08));
  border-left: 3px solid color-mix(in srgb, var(--card-accent) 50%, rgba(12, 235, 255, 0.2));
  box-shadow:
    0 4px 18px rgba(0, 0, 0, 0.2),
    inset 0 1px 0 rgba(255, 255, 255, 0.03),
    0 0 16px color-mix(in srgb, var(--card-accent) 7%, transparent);
  transition:
    transform 0.35s cubic-bezier(0.22, 1, 0.36, 1),
    box-shadow 0.35s ease,
    border-color 0.35s ease;
}

.timeline-year-row--inview .timeline-card {
  animation: timeline-card-in 0.68s cubic-bezier(0.22, 1, 0.36, 1) backwards;
  animation-delay: calc(0.12s + 0.04s * var(--cluster-idx) + 0.055s * var(--stagger));
  pointer-events: auto;
}

@media (hover: hover) and (pointer: fine) {
  .timeline-year-row--inview .timeline-card:hover {
    transform: translateY(-2px);
    border-color: color-mix(in srgb, var(--card-accent) 30%, rgba(12, 235, 255, 0.12));
    border-left-color: color-mix(in srgb, var(--card-accent) 58%, rgba(12, 235, 255, 0.25));
    box-shadow:
      0 8px 26px rgba(0, 0, 0, 0.28),
      inset 0 1px 0 rgba(255, 255, 255, 0.04),
      0 0 26px color-mix(in srgb, var(--card-accent) 18%, transparent);
  }
}

.timeline-card[data-kind='github'] {
  --card-accent: var(--neo-blue);
}
.timeline-card[data-kind='education'] {
  --card-accent: var(--neo-violet);
}
.timeline-card[data-kind='employment'] {
  --card-accent: rgb(130, 220, 255);
}
.timeline-card[data-kind='contract'] {
  --card-accent: var(--neo-pink);
}

.timeline-card-inner {
  position: relative;
  border-radius: 6px;
  margin: 0;
  padding: 0.72rem 0.85rem 0.82rem 0.72rem;
  background: transparent;
  overflow: hidden;
}

.timeline-card-inner::before {
  content: '';
  position: absolute;
  inset-inline: -20% 40%;
  top: -40%;
  height: 55%;
  background: linear-gradient(125deg, var(--card-accent), transparent 72%);
  opacity: 0.09;
  transform: rotate(-8deg);
  pointer-events: none;
}

.timeline-card-top {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 0.35rem 0.75rem;
  margin-bottom: 0.38rem;
}

.timeline-card-kind {
  font-size: 0.62rem;
  font-weight: 700;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: color-mix(in srgb, var(--card-accent) 70%, white);
}

.timeline-card-span {
  font-family: var(--font-mono);
  font-size: 0.66rem;
  letter-spacing: 0.03em;
  color: rgba(175, 200, 255, 0.42);
  padding: 0.2rem 0.45rem;
  border-radius: 6px;
  border: 1px solid color-mix(in srgb, var(--card-accent) 22%, rgba(12, 235, 255, 0.1));
  background: color-mix(in srgb, var(--card-accent) 5%, rgba(5, 8, 22, 0.55));
}

.timeline-card-title {
  margin: 0 0 0.28rem;
  font-family: var(--font-mono);
  font-size: 0.92rem;
  font-weight: 600;
  letter-spacing: 0.02em;
  color: var(--color-heading);
  line-height: 1.35;
}

.timeline-card-context {
  margin: 0 0 0.4rem;
  font-size: 0.76rem;
  letter-spacing: 0.035em;
  color: rgba(175, 200, 255, 0.52);
}

.timeline-card-summary {
  margin: 0;
  font-size: 0.86rem;
  line-height: 1.58;
  color: rgba(200, 218, 255, 0.82);
  text-shadow: 0 1px 10px rgba(5, 5, 20, 0.7);
}

.timeline-link {
  color: inherit;
  text-decoration: underline;
  text-decoration-color: color-mix(in srgb, var(--card-accent) 40%, transparent);
  text-underline-offset: 3px;
  transition: text-decoration-color 0.15s ease;
}

.timeline-link:hover {
  text-decoration-color: color-mix(in srgb, var(--card-accent) 80%, white);
}

.timeline-empty {
  margin: 0;
  padding: 0.85rem 0.65rem 1rem;
  font-size: 0.86rem;
  color: rgba(175, 200, 255, 0.52);
  animation: timeline-soft-rise 0.45s ease backwards;
}

@keyframes timeline-scale-sweep {
  from {
    transform: scaleX(0.06);
    opacity: 0.2;
  }
  to {
    transform: scaleX(1);
    opacity: 0.85;
  }
}

@keyframes timeline-soft-rise {
  from {
    opacity: 0;
    transform: translateY(8px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes timeline-track-reveal {
  from {
    transform: translateX(-50%) scaleY(0.06);
    opacity: 0.25;
  }
  to {
    transform: translateX(-50%) scaleY(1);
    opacity: 1;
  }
}

@keyframes timeline-rail-pop {
  from {
    opacity: 0;
    transform: translateY(10px) scale(0.85);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

@keyframes timeline-head-slide {
  from {
    opacity: 0;
    transform: translateX(-10px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

@keyframes timeline-glitch-fade {
  from {
    opacity: 0;
    transform: translateX(6px) skewX(-4deg);
  }
  to {
    opacity: 0.35;
    transform: translateX(0) skewX(0);
  }
}

@keyframes timeline-card-in {
  from {
    opacity: 0;
    transform: translateY(14px) scale(0.97);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

@media (prefers-reduced-motion: reduce) {
  .timeline-board:not(.timeline-board--cue) .timeline-scale-mark,
  .timeline-board:not(.timeline-board--cue) .timeline-scale-text,
  .timeline-board:not(.timeline-board--cue) .timeline-scale-unit {
    opacity: 1;
    transform: none;
  }

  .timeline-shell-track {
    transform: translateX(-50%) scaleY(1);
    opacity: 1;
  }

  .timeline-year-row:not(.timeline-year-row--inview) .timeline-cluster-rail,
  .timeline-year-row:not(.timeline-year-row--inview) .timeline-year-cluster-head,
  .timeline-year-row:not(.timeline-year-row--inview) .timeline-card {
    opacity: 1;
    pointer-events: auto;
  }

  .timeline-year-row--inview .timeline-cluster-rail,
  .timeline-year-row--inview .timeline-year-cluster-head,
  .timeline-year-row--inview .timeline-year-glitch,
  .timeline-year-row--inview .timeline-card,
  .timeline-empty {
    animation: none;
  }

  .timeline-card {
    transition: none;
  }
}

@media (max-width: 540px) {
  .timeline-shell-track {
    display: none;
  }

  .timeline-year-row {
    grid-template-columns: 1fr;
  }

  .timeline-cluster-rail {
    flex-direction: row;
    justify-content: flex-start;
    padding: 0 0 0.35rem;
    gap: 0.5rem;
    border-bottom: 1px dashed rgba(12, 235, 255, 0.15);
    margin-bottom: 0.15rem;
  }

  .timeline-rail-node {
    flex-direction: row;
    align-items: center;
    gap: 0.45rem;
  }

  .timeline-year-cluster-head .timeline-year-display {
    font-size: clamp(1.35rem, 7vw, 1.85rem);
  }

  .timeline-year-glitch {
    display: none;
  }
}

/* Technology list: mono tags; coloured shell per `data-primary-area`. */
.focus-tech {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem 0.65rem;
  margin: 0.15rem 0 0;
  padding: 0;
  list-style: none;
}

.focus-tech-label {
  display: block;
  padding: 0.48rem 0.8rem 0.48rem 0.65rem;
  font-family: var(--font-mono);
  font-size: 0.8rem;
  font-weight: 500;
  letter-spacing: 0.025em;
  line-height: 1.4;
  color: color-mix(in srgb, var(--focus-accent) 12%, rgba(220, 232, 255, 0.94));
  text-shadow: 0 1px 10px rgba(5, 5, 20, 0.7);
}

.contact-list {
  margin: 0;
  padding: 0;
  list-style: none;
  display: grid;
  gap: 0.65rem;
}

.contact-list li {
  display: grid;
  grid-template-columns: 5.5rem 1fr;
  gap: 0.75rem;
  align-items: baseline;
  font-size: 0.84rem;
  line-height: 1.5;
}

.contact-label {
  font-size: 0.72rem;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: rgba(12, 235, 255, 0.55);
}

.contact-value {
  font-family: var(--font-mono);
  color: rgba(200, 218, 255, 0.78);
  word-break: break-word;
}

@media (max-width: 480px) {
  .contact-list li {
    grid-template-columns: 1fr;
    gap: 0.15rem;
  }
}
</style>
