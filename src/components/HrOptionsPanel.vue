<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useSiteLocale } from '@/composables/useSiteLocale'
import type { LocaleCode } from '@/locale/types'

const { locale, ui } = useSiteLocale()
const router = useRouter()

const rootEl = ref<HTMLElement | null>(null)
const panelOpen = ref(false)
const cvLocale = ref<LocaleCode>(locale.value)
const printerFriendly = ref(false)

function closePanel() {
  panelOpen.value = false
}

function togglePanel(ev: MouseEvent) {
  ev.stopPropagation()
  panelOpen.value = !panelOpen.value
}

function onDocumentClick(ev: MouseEvent) {
  if (!panelOpen.value || !rootEl.value) return
  if (!rootEl.value.contains(ev.target as Node)) closePanel()
}

onMounted(() => {
  document.addEventListener('click', onDocumentClick)
})

onBeforeUnmount(() => {
  document.removeEventListener('click', onDocumentClick)
})

function setCvLocale(code: LocaleCode) {
  cvLocale.value = code
}

function exportCv() {
  const url = router.resolve({
    path: '/cv',
    query: {
      lang: cvLocale.value,
      economy: printerFriendly.value ? '1' : '0',
      autoprint: '1',
    },
  }).href
  window.open(url, '_blank', 'noopener,noreferrer')
  closePanel()
}
</script>

<template>
  <div ref="rootEl" class="hr-panel" @click.stop>
    <button
      type="button"
      class="hr-panel__toggle"
      :aria-expanded="panelOpen"
      :aria-controls="'hr-panel-popover'"
      :aria-label="ui.hr.toggleAria"
      @click="togglePanel"
    >
      <span class="hr-panel__toggle-text" aria-hidden="true">HR</span>
    </button>

    <div
      v-show="panelOpen"
      id="hr-panel-popover"
      class="hr-panel__popover"
      role="region"
      :aria-label="ui.hr.panelTitle"
    >
      <p class="hr-panel__title">{{ ui.hr.panelTitle }}</p>

      <div class="hr-panel__field">
        <span class="hr-panel__label" id="hr-cv-lang-label">{{ ui.hr.cvLanguage }}</span>
        <div
          class="hr-panel__lang"
          role="group"
          :aria-labelledby="'hr-cv-lang-label'"
        >
          <button
            type="button"
            class="hr-panel__lang-btn"
            :class="{ 'hr-panel__lang-btn--on': cvLocale === 'en' }"
            :aria-pressed="cvLocale === 'en'"
            @click="setCvLocale('en')"
          >
            EN
          </button>
          <button
            type="button"
            class="hr-panel__lang-btn"
            :class="{ 'hr-panel__lang-btn--on': cvLocale === 'cs' }"
            :aria-pressed="cvLocale === 'cs'"
            @click="setCvLocale('cs')"
          >
            CS
          </button>
        </div>
      </div>

      <div class="hr-panel__field hr-panel__field--switch">
        <button
          type="button"
          class="hr-panel__switch"
          role="switch"
          :aria-checked="printerFriendly"
          :aria-describedby="'hr-print-hint'"
          @click="printerFriendly = !printerFriendly"
        >
          <span class="hr-panel__switch-track">
            <span
              class="hr-panel__switch-thumb"
              :class="{ 'hr-panel__switch-thumb--on': printerFriendly }"
            />
          </span>
          <span class="hr-panel__switch-label">{{ ui.hr.printerFriendly }}</span>
        </button>
        <p id="hr-print-hint" class="hr-panel__hint">{{ ui.hr.printerFriendlyHint }}</p>
      </div>

      <button
        type="button"
        class="hr-panel__export"
        :aria-label="ui.hr.exportAria"
        @click="exportCv"
      >
        {{ ui.hr.exportCv }}
      </button>
    </div>
  </div>
</template>

<style scoped>
.hr-panel {
  position: relative;
  pointer-events: auto;
}

.hr-panel__toggle {
  margin: 0;
  padding: 0.32rem 0.5rem;
  font-family: var(--font-mono);
  font-size: 0.62rem;
  font-weight: 700;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  cursor: pointer;
  touch-action: manipulation;
  -webkit-tap-highlight-color: rgba(12, 235, 255, 0.15);
  color: rgba(210, 225, 255, 0.88);
  background: rgba(5, 8, 20, 0.65);
  border: 1px solid rgba(12, 235, 255, 0.22);
  border-radius: 8px;
  transition:
    border-color 0.15s ease,
    background 0.15s ease,
    box-shadow 0.15s ease;
}

.hr-panel__toggle:hover {
  border-color: rgba(12, 235, 255, 0.45);
}

.hr-panel__toggle:focus-visible {
  outline: 2px solid rgba(12, 235, 255, 0.55);
  outline-offset: 2px;
}

.hr-panel__toggle[aria-expanded='true'] {
  border-color: rgba(176, 102, 255, 0.45);
  background: rgba(176, 102, 255, 0.1);
}

.hr-panel__toggle-text {
  display: block;
  line-height: 1.2;
}

.hr-panel__popover {
  position: absolute;
  right: 0;
  bottom: calc(100% + 0.45rem);
  width: min(16.5rem, calc(100vw - 2rem));
  padding: 0.65rem 0.72rem 0.72rem;
  border-radius: 10px;
  border: 1px solid rgba(12, 235, 255, 0.28);
  background: rgba(8, 10, 24, 0.96);
  box-shadow:
    0 -8px 32px rgba(0, 0, 0, 0.45),
    0 0 24px rgba(12, 235, 255, 0.08);
  text-align: left;
  z-index: 60;
}

.hr-panel__title {
  margin: 0 0 0.55rem;
  font-family: var(--font-display);
  font-size: 0.58rem;
  font-weight: 400;
  letter-spacing: 0.18em;
  text-transform: uppercase;
  color: rgba(238, 246, 255, 0.88);
}

.hr-panel__field {
  margin-bottom: 0.55rem;
}

.hr-panel__field--switch {
  margin-bottom: 0.6rem;
}

.hr-panel__label {
  display: block;
  margin-bottom: 0.35rem;
  font-size: 0.58rem;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: rgba(175, 200, 255, 0.55);
}

.hr-panel__lang {
  display: flex;
  gap: 0.3rem;
}

.hr-panel__lang-btn {
  margin: 0;
  padding: 0.28rem 0.5rem;
  font-family: var(--font-mono);
  font-size: 0.62rem;
  font-weight: 600;
  letter-spacing: 0.08em;
  cursor: pointer;
  touch-action: manipulation;
  -webkit-tap-highlight-color: rgba(12, 235, 255, 0.12);
  color: rgba(200, 218, 255, 0.75);
  background: rgba(5, 8, 20, 0.55);
  border: 1px solid rgba(12, 235, 255, 0.2);
  border-radius: 6px;
  transition:
    border-color 0.15s ease,
    background 0.15s ease,
    color 0.15s ease;
}

.hr-panel__lang-btn:hover {
  border-color: rgba(12, 235, 255, 0.4);
  color: rgba(248, 250, 255, 0.95);
}

.hr-panel__lang-btn--on {
  border-color: rgba(12, 235, 255, 0.55);
  background: rgba(12, 235, 255, 0.1);
  color: rgba(248, 250, 255, 0.98);
}

.hr-panel__switch {
  display: flex;
  align-items: center;
  gap: 0.45rem;
  margin: 0;
  padding: 0;
  width: 100%;
  border: none;
  background: transparent;
  cursor: pointer;
  touch-action: manipulation;
  -webkit-tap-highlight-color: rgba(12, 235, 255, 0.12);
  text-align: left;
}

.hr-panel__switch:focus-visible .hr-panel__switch-track {
  outline: 2px solid rgba(12, 235, 255, 0.55);
  outline-offset: 3px;
  border-radius: 999px;
}

.hr-panel__switch-track {
  position: relative;
  flex: 0 0 2.35rem;
  height: 1.15rem;
  border-radius: 999px;
  background: rgba(5, 8, 20, 0.85);
  border: 1px solid rgba(12, 235, 255, 0.22);
  transition: border-color 0.15s ease, background 0.15s ease;
}

.hr-panel__switch-thumb {
  position: absolute;
  top: 50%;
  left: 0.12rem;
  width: 0.85rem;
  height: 0.85rem;
  border-radius: 50%;
  background: rgba(210, 225, 255, 0.85);
  transform: translate(0, -50%);
  transition: transform 0.2s ease, background 0.2s ease;
}

.hr-panel__switch-thumb--on {
  transform: translate(1.2rem, -50%);
  background: rgba(12, 235, 255, 0.92);
}

.hr-panel__switch[aria-checked='true'] .hr-panel__switch-track {
  border-color: rgba(12, 235, 255, 0.45);
  background: rgba(12, 235, 255, 0.08);
}

.hr-panel__switch-label {
  font-family: var(--font-mono);
  font-size: 0.64rem;
  font-weight: 600;
  letter-spacing: 0.04em;
  color: rgba(220, 232, 255, 0.9);
}

.hr-panel__hint {
  margin: 0.35rem 0 0;
  padding-left: 2.8rem;
  font-size: 0.58rem;
  line-height: 1.45;
  color: rgba(175, 200, 255, 0.42);
}

.hr-panel__export {
  display: block;
  width: 100%;
  margin: 0;
  padding: 0.45rem 0.55rem;
  font-family: var(--font-mono);
  font-size: 0.6rem;
  font-weight: 700;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  cursor: pointer;
  touch-action: manipulation;
  -webkit-tap-highlight-color: rgba(12, 235, 255, 0.15);
  color: rgba(5, 6, 14, 0.95);
  background: linear-gradient(105deg, var(--neo-blue), var(--neo-violet) 55%, var(--neo-pink));
  border: none;
  border-radius: 6px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.25);
  transition: filter 0.15s ease, transform 0.15s ease;
}

.hr-panel__export:hover {
  filter: brightness(1.08);
  transform: translateY(-1px);
}

.hr-panel__export:focus-visible {
  outline: 2px solid rgba(12, 235, 255, 0.65);
  outline-offset: 2px;
}
</style>
