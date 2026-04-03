<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, watch } from 'vue'
import { RouterLink, useRoute } from 'vue-router'
import { getSiteUi } from '@/composables/useSiteLocale'
import { getFocusItems } from '@/content/focusItems'
import { getTimelineEntries } from '@/content/timelineEntries'
import type { LocaleCode, SiteUi } from '@/locale/types'
import type { TimelineEntry, TimelineKind } from '@/content/types'

const route = useRoute()

const lang = computed((): LocaleCode => (route.query.lang === 'cs' ? 'cs' : 'en'))
const economy = computed(() => route.query.economy === '1')

const ui = computed((): SiteUi => getSiteUi(lang.value))

const dateLocaleTag = computed(() => (lang.value === 'cs' ? 'cs-CZ' : 'en-GB'))

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
  return d.toLocaleDateString(dateLocaleTag.value, { month: 'short', year: 'numeric' })
}

function formatRange(e: TimelineEntry): string {
  const a = formatMonthLabel(e.start)
  const b = e.end ? formatMonthLabel(e.end) : ui.value.timeline.present
  return `${a} — ${b}`
}

function kindLabel(kind: TimelineKind): string {
  const f = ui.value.timeline.filters
  const map: Record<TimelineKind, string> = {
    github: f.github,
    education: f.education,
    employment: f.employment,
    contract: f.contract,
  }
  return map[kind] ?? kind
}

const sortedEntries = computed(() => {
  const list = [...getTimelineEntries(lang.value)]
  list.sort((a, b) => {
    const d = endSortTime(b) - endSortTime(a)
    if (d !== 0) return d
    return parseMonth(b.start) - parseMonth(a.start)
  })
  return list
})

const focusItems = computed(() => getFocusItems(lang.value))

const DEFAULT_DOC_TITLE = 'Pavel Urx'

watch(
  () => [ui.value.hero.name, ui.value.cv.documentTitleSuffix] as const,
  () => {
    document.title = `${ui.value.hero.name} — ${ui.value.cv.documentTitleSuffix}`
  },
  { immediate: true },
)

onBeforeUnmount(() => {
  document.title = DEFAULT_DOC_TITLE
})

function printCv() {
  window.print()
}

onMounted(() => {
  if (route.query.autoprint === '1') {
    requestAnimationFrame(() => {
      setTimeout(() => window.print(), 400)
    })
  }
})
</script>

<template>
  <div
    class="cv-root"
    :class="{ 'cv--economy': economy }"
  >
    <header class="cv-screen-bar">
      <RouterLink to="/" class="cv-back">{{ ui.cv.backToSite }}</RouterLink>
      <p class="cv-screen-hint">{{ ui.cv.screenIntro }}</p>
      <button type="button" class="cv-print-btn" @click="printCv">
        {{ ui.cv.printOrSavePdf }}
      </button>
    </header>

    <article class="cv-sheet">
      <header class="cv-header">
        <h1 class="cv-name">{{ ui.hero.name }}</h1>
        <p class="cv-role">{{ ui.hero.role }}</p>
        <p class="cv-tagline">{{ ui.hero.tagline }}</p>
      </header>

      <section class="cv-section">
        <h2 class="cv-section-title">{{ ui.about.heading }}</h2>
        <p class="cv-about-body">{{ ui.about.body }}</p>
      </section>

      <section class="cv-section">
        <h2 class="cv-section-title">{{ ui.timeline.heading }}</h2>
        <div class="cv-entries">
          <article
            v-for="entry in sortedEntries"
            :key="entry.id"
            class="cv-entry"
            :data-kind="entry.kind"
          >
            <div class="cv-entry-meta">
              <span class="cv-entry-kind">{{ kindLabel(entry.kind) }}</span>
              <span class="cv-entry-dates">{{ formatRange(entry) }}</span>
            </div>
            <h3 class="cv-entry-title">
              <a
                v-if="entry.href"
                :href="entry.href"
                class="cv-entry-title-link"
                target="_blank"
                rel="noopener noreferrer"
              >
                {{ entry.title }}
              </a>
              <template v-else>{{ entry.title }}</template>
            </h3>
            <p class="cv-entry-context">{{ entry.context }}</p>
            <p class="cv-entry-summary">{{ entry.summary }}</p>
            <p v-if="entry.href" class="cv-entry-url">{{ entry.href }}</p>
            <div
              v-if="entry.details"
              class="cv-entry-details"
            >
              {{ entry.details }}
            </div>
          </article>
        </div>
      </section>

      <section class="cv-section">
        <h2 class="cv-section-title">{{ ui.focus.heading }}</h2>
        <ul class="cv-skills">
          <li
            v-for="(item, i) in focusItems"
            :key="`${item.label}-${i}`"
            class="cv-skill-item"
          >
            {{ item.label }}
          </li>
        </ul>
      </section>

      <section class="cv-section">
        <h2 class="cv-section-title">{{ ui.contact.heading }}</h2>
        <dl class="cv-contact">
          <div class="cv-contact-row">
            <dt>{{ ui.contact.email }}</dt>
            <dd>{{ ui.contactValues.email }}</dd>
          </div>
          <div class="cv-contact-row">
            <dt>{{ ui.contact.github }}</dt>
            <dd>{{ ui.contactValues.github }}</dd>
          </div>
          <div class="cv-contact-row">
            <dt>{{ ui.contact.linkedin }}</dt>
            <dd>{{ ui.contactValues.linkedin }}</dd>
          </div>
          <div class="cv-contact-row">
            <dt>{{ ui.contact.location }}</dt>
            <dd>{{ ui.contactValues.location }}</dd>
          </div>
        </dl>
      </section>
    </article>
  </div>
</template>

<style scoped>
/* —— Default: match portfolio (full colour, dark “neon” UI) —— */
.cv-root {
  min-height: 100dvh;
  padding: clamp(1rem, 3vmin, 1.75rem);
  position: relative;
  isolation: isolate;
  color: var(--color-heading);
  font-family: var(--font-mono);
  font-size: 0.92rem;
  line-height: 1.58;
  text-align: left;
  background-color: var(--color-background-solid);
  background-image:
    radial-gradient(ellipse 68% 52% at 48% 36%, var(--color-glow-blue), transparent 58%),
    radial-gradient(ellipse 48% 42% at 78% 14%, var(--color-glow-pink), transparent 52%),
    radial-gradient(ellipse 38% 48% at 12% 78%, var(--color-glow-violet), transparent 55%);
  background-attachment: fixed;
}

.cv-screen-bar {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 0.65rem 1rem;
  max-width: min(92vw, clamp(20rem, 52vw + 12rem, 52rem));
  margin: 0 auto 1.25rem;
  padding: 0.55rem 0.75rem;
  border-radius: 10px;
  border: 1px solid rgba(12, 235, 255, 0.22);
  background: linear-gradient(180deg, rgba(5, 5, 20, 0.88) 0%, rgba(5, 5, 20, 0.72) 100%);
  box-shadow: 0 8px 28px rgba(0, 0, 0, 0.35);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
}

.cv-back {
  font-family: var(--font-mono);
  font-size: 0.68rem;
  font-weight: 600;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: rgba(12, 235, 255, 0.85);
  text-decoration: none;
  text-shadow: 0 0 12px rgba(12, 235, 255, 0.25);
}

.cv-back:hover {
  color: var(--neo-blue);
  text-decoration: underline;
  text-underline-offset: 3px;
}

.cv-screen-hint {
  flex: 1 1 12rem;
  margin: 0;
  font-size: 0.72rem;
  letter-spacing: 0.03em;
  color: var(--color-text-muted);
}

.cv-print-btn {
  margin: 0;
  padding: 0.42rem 0.72rem;
  font-family: var(--font-mono);
  font-size: 0.62rem;
  font-weight: 700;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  cursor: pointer;
  color: rgba(5, 6, 18, 0.92);
  border: none;
  border-radius: 8px;
  background: linear-gradient(105deg, var(--neo-blue), var(--neo-violet) 52%, var(--neo-pink));
  box-shadow:
    0 4px 18px rgba(0, 0, 0, 0.35),
    0 0 20px rgba(12, 235, 255, 0.15);
  transition: filter 0.15s ease, transform 0.15s ease;
}

.cv-print-btn:hover {
  filter: brightness(1.08);
  transform: translateY(-1px);
}

.cv-print-btn:focus-visible {
  outline: 2px solid rgba(12, 235, 255, 0.55);
  outline-offset: 2px;
}

.cv-sheet {
  max-width: min(92vw, clamp(20rem, 52vw + 12rem, 52rem));
  margin: 0 auto;
  padding: clamp(1.35rem, 4vmin, 2rem) clamp(1.1rem, 3.5vw, 1.75rem);
  border-radius: 0;
  border: 1px solid rgba(12, 235, 255, 0.14);
  border-top: 1px solid rgba(12, 235, 255, 0.22);
  background: linear-gradient(180deg, rgba(5, 5, 20, 0.55) 0%, rgba(5, 5, 20, 0.38) 100%);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  box-shadow: 0 4px 40px rgba(0, 0, 0, 0.25);
}

.cv-header {
  margin-bottom: 1.35rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid transparent;
  border-image: linear-gradient(90deg, var(--neo-blue), var(--neo-violet) 50%, var(--neo-pink)) 1;
}

.cv-name {
  margin: 0 0 0.45rem;
  font-family: var(--font-display);
  font-size: clamp(1.4rem, 4.5vmin, 2rem);
  font-weight: 400;
  letter-spacing: 0.06em;
  line-height: 1.15;
  background: linear-gradient(105deg, var(--neo-blue), var(--neo-violet) 48%, var(--neo-pink));
  background-clip: text;
  -webkit-background-clip: text;
  color: transparent;
  filter: drop-shadow(0 0 18px rgba(12, 235, 255, 0.22));
}

.cv-role {
  margin: 0 0 0.35rem;
  font-family: var(--font-mono);
  font-size: 0.74rem;
  font-weight: 600;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: rgba(200, 220, 255, 0.72);
}

.cv-tagline {
  margin: 0;
  font-size: 0.86rem;
  letter-spacing: 0.04em;
  color: var(--color-text-muted);
  max-width: 52ch;
}

.cv-section {
  margin-bottom: 1.35rem;
}

.cv-section:last-child {
  margin-bottom: 0;
}

.cv-section-title {
  margin: 0 0 0.6rem;
  font-family: var(--font-display);
  font-size: 0.68rem;
  font-weight: 400;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: rgba(238, 246, 255, 0.9);
}

.cv-section-title::after {
  content: '';
  display: block;
  width: 2.25rem;
  height: 1px;
  margin-top: 0.45rem;
  background: linear-gradient(90deg, var(--neo-blue), transparent);
  opacity: 0.85;
}

.cv-about-body {
  margin: 0;
  white-space: pre-wrap;
  font-size: 0.9rem;
  color: rgba(200, 218, 255, 0.82);
  text-shadow: 0 1px 14px rgba(5, 5, 20, 0.85);
}

.cv-entries {
  display: flex;
  flex-direction: column;
  gap: 0.85rem;
}

.cv-entry {
  --entry-accent: var(--neo-blue);
  padding: 0.72rem 0.85rem 0.82rem 0.72rem;
  border-radius: 8px;
  background: linear-gradient(
    165deg,
    color-mix(in srgb, var(--entry-accent) 8%, rgba(14, 18, 38)),
    rgba(7, 10, 26, 0.82)
  );
  border: 1px solid color-mix(in srgb, var(--entry-accent) 22%, rgba(12, 235, 255, 0.08));
  border-left: 3px solid color-mix(in srgb, var(--entry-accent) 55%, rgba(12, 235, 255, 0.2));
  box-shadow:
    0 4px 18px rgba(0, 0, 0, 0.2),
    inset 0 1px 0 rgba(255, 255, 255, 0.03);
}

.cv-entry[data-kind='github'] {
  --entry-accent: var(--neo-blue);
}

.cv-entry[data-kind='education'] {
  --entry-accent: var(--neo-violet);
}

.cv-entry[data-kind='employment'] {
  --entry-accent: rgb(130, 220, 255);
}

.cv-entry[data-kind='contract'] {
  --entry-accent: var(--neo-pink);
}

.cv-entry-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 0.35rem 0.75rem;
  margin-bottom: 0.38rem;
  font-size: 0.6rem;
  font-weight: 700;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: color-mix(in srgb, var(--entry-accent) 70%, white);
}

.cv-entry-dates {
  font-family: var(--font-mono);
  font-size: 0.64rem;
  font-weight: 500;
  letter-spacing: 0.03em;
  text-transform: none;
  color: rgba(175, 200, 255, 0.45);
  padding: 0.2rem 0.45rem;
  border-radius: 6px;
  border: 1px solid color-mix(in srgb, var(--entry-accent) 22%, rgba(12, 235, 255, 0.1));
  background: color-mix(in srgb, var(--entry-accent) 5%, rgba(5, 8, 22, 0.55));
}

.cv-entry-title {
  margin: 0 0 0.28rem;
  font-family: var(--font-mono);
  font-size: 0.92rem;
  font-weight: 600;
  letter-spacing: 0.02em;
  color: var(--color-heading);
  line-height: 1.35;
}

.cv-entry-title-link {
  color: inherit;
  text-decoration: underline;
  text-decoration-color: color-mix(in srgb, var(--entry-accent) 45%, transparent);
  text-underline-offset: 3px;
}

.cv-entry-title-link:hover {
  text-decoration-color: color-mix(in srgb, var(--entry-accent) 85%, white);
}

.cv-entry-context {
  margin: 0 0 0.35rem;
  font-size: 0.76rem;
  letter-spacing: 0.035em;
  color: rgba(175, 200, 255, 0.52);
}

.cv-entry-summary {
  margin: 0;
  font-size: 0.86rem;
  line-height: 1.58;
  color: rgba(200, 218, 255, 0.82);
  white-space: pre-wrap;
  text-shadow: 0 1px 10px rgba(5, 5, 20, 0.7);
}

.cv-entry-url {
  margin: 0.4rem 0 0;
  font-family: var(--font-mono);
  font-size: 0.7rem;
  word-break: break-all;
  color: color-mix(in srgb, var(--entry-accent) 45%, rgba(200, 220, 255, 0.9));
}

.cv-entry-details {
  margin-top: 0.55rem;
  padding-top: 0.5rem;
  font-size: 0.82rem;
  line-height: 1.62;
  white-space: pre-wrap;
  color: rgba(185, 205, 255, 0.82);
  border-top: 1px solid color-mix(in srgb, var(--entry-accent) 18%, rgba(12, 235, 255, 0.08));
  text-shadow: 0 1px 10px rgba(5, 5, 20, 0.65);
}

.cv-skills {
  margin: 0.15rem 0 0;
  padding: 0;
  list-style: none;
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
}

.cv-skill-item {
  margin: 0;
  padding: 0.42rem 0.72rem 0.42rem 0.6rem;
  font-family: var(--font-mono);
  font-size: 0.8rem;
  letter-spacing: 0.02em;
  line-height: 1.45;
  color: rgba(220, 232, 255, 0.9);
  border-radius: 8px;
  background: linear-gradient(165deg, rgba(12, 235, 255, 0.06), rgba(7, 10, 26, 0.75));
  border: 1px solid rgba(12, 235, 255, 0.14);
  border-left: 3px solid rgba(12, 235, 255, 0.35);
}

.cv-contact {
  margin: 0;
}

.cv-contact-row {
  display: grid;
  grid-template-columns: 6.5rem 1fr;
  gap: 0.5rem 1rem;
  margin-bottom: 0.45rem;
  font-size: 0.84rem;
  line-height: 1.5;
}

.cv-contact-row dt {
  margin: 0;
  font-size: 0.68rem;
  font-weight: 600;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: rgba(12, 235, 255, 0.55);
}

.cv-contact-row dd {
  margin: 0;
  font-family: var(--font-mono);
  font-size: 0.82rem;
  color: rgba(200, 218, 255, 0.78);
  word-break: break-word;
}

@media (max-width: 520px) {
  .cv-contact-row {
    grid-template-columns: 1fr;
  }

  .cv-screen-bar {
    backdrop-filter: none;
    -webkit-backdrop-filter: none;
    background: linear-gradient(180deg, rgba(5, 5, 20, 0.96) 0%, rgba(5, 5, 20, 0.9) 100%);
  }

  .cv-sheet {
    backdrop-filter: none;
    -webkit-backdrop-filter: none;
    background: linear-gradient(180deg, rgba(5, 5, 20, 0.94) 0%, rgba(5, 5, 20, 0.88) 100%);
  }
}

/* —— Printer-friendly: plain paper, minimal ink (clearly different) —— */
.cv-root.cv--economy {
  background: #f5f5f5;
  background-image: none;
  color: #111;
}

.cv-root.cv--economy .cv-screen-bar {
  border: 1px solid #bbb;
  background: #fff;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.08);
  backdrop-filter: none;
  -webkit-backdrop-filter: none;
}

.cv-root.cv--economy .cv-back {
  color: #222;
  text-shadow: none;
}

.cv-root.cv--economy .cv-back:hover {
  color: #000;
}

.cv-root.cv--economy .cv-screen-hint {
  color: #555;
}

.cv-root.cv--economy .cv-print-btn {
  background: #333;
  color: #fff;
  box-shadow: none;
}

.cv-root.cv--economy .cv-print-btn:hover {
  filter: none;
  background: #111;
}

.cv-root.cv--economy .cv-sheet {
  border: 1px solid #ccc;
  border-top: 1px solid #ccc;
  background: #fff;
  box-shadow: none;
  backdrop-filter: none;
  -webkit-backdrop-filter: none;
}

.cv-root.cv--economy .cv-header {
  border-image: none;
  border-bottom: 2px solid #111;
}

.cv-root.cv--economy .cv-name {
  background: none;
  -webkit-background-clip: unset;
  background-clip: unset;
  color: #111;
  filter: none;
  font-family: system-ui, 'Segoe UI', sans-serif;
  font-weight: 700;
}

.cv-root.cv--economy .cv-role {
  color: #333;
}

.cv-root.cv--economy .cv-tagline {
  color: #444;
}

.cv-root.cv--economy .cv-section-title {
  font-family: system-ui, 'Segoe UI', sans-serif;
  color: #111;
  letter-spacing: 0.08em;
}

.cv-root.cv--economy .cv-section-title::after {
  background: #111;
  width: 2rem;
  opacity: 1;
}

.cv-root.cv--economy .cv-about-body {
  color: #222;
  text-shadow: none;
}

.cv-root.cv--economy .cv-entry {
  background: #fafafa;
  border: 1px solid #ddd;
  border-left: 3px solid #666;
  box-shadow: none;
}

.cv-root.cv--economy .cv-entry[data-kind='github'],
.cv-root.cv--economy .cv-entry[data-kind='education'],
.cv-root.cv--economy .cv-entry[data-kind='employment'],
.cv-root.cv--economy .cv-entry[data-kind='contract'] {
  border-left-color: #666;
}

.cv-root.cv--economy .cv-entry-meta {
  color: #333;
}

.cv-root.cv--economy .cv-entry-dates {
  color: #555;
  border-color: #ccc;
  background: #fff;
}

.cv-root.cv--economy .cv-entry-title {
  color: #111;
}

.cv-root.cv--economy .cv-entry-title-link {
  text-decoration-color: #333;
}

.cv-root.cv--economy .cv-entry-context {
  color: #555;
}

.cv-root.cv--economy .cv-entry-summary {
  color: #222;
  text-shadow: none;
}

.cv-root.cv--economy .cv-entry-url {
  color: #111;
}

.cv-root.cv--economy .cv-entry-details {
  color: #222;
  border-top-color: #ddd;
  text-shadow: none;
}

.cv-root.cv--economy .cv-skill-item {
  background: #fafafa;
  border: 1px solid #ddd;
  border-left: 3px solid #888;
  color: #222;
}

.cv-root.cv--economy .cv-contact-row dt {
  color: #333;
}

.cv-root.cv--economy .cv-contact-row dd {
  color: #111;
}

@media print {
  .cv-screen-bar {
    display: none !important;
  }

  /* Full-colour export: keep neon look on paper (uses more ink) */
  .cv-root:not(.cv--economy) {
    min-height: auto;
    padding: 0;
    background: var(--void-deep) !important;
    background-image: none !important;
    -webkit-print-color-adjust: exact;
    print-color-adjust: exact;
  }

  .cv-root:not(.cv--economy) .cv-sheet {
    border: 1px solid rgba(12, 235, 255, 0.25);
    background: rgba(8, 10, 22, 0.95) !important;
    backdrop-filter: none !important;
    -webkit-backdrop-filter: none !important;
    box-shadow: none !important;
  }

  /* Ink-saving export */
  .cv-root.cv--economy {
    background: #fff !important;
    background-image: none !important;
    -webkit-print-color-adjust: economy;
    print-color-adjust: economy;
  }

  .cv-root.cv--economy .cv-sheet {
    border: none !important;
    background: #fff !important;
  }

  .cv-root.cv--economy,
  .cv-root.cv--economy .cv-header,
  .cv-root.cv--economy .cv-entry,
  .cv-root.cv--economy .cv-skill-item {
    color: #000 !important;
    box-shadow: none !important;
  }

  .cv-root.cv--economy .cv-name {
    color: #000 !important;
  }

  .cv-root.cv--economy a {
    color: #000 !important;
    text-decoration: underline !important;
  }
}
</style>
