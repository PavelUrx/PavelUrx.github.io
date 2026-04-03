import { computed, ref, watch } from 'vue'
import type { LocaleCode, SiteUi } from '@/locale/types'
import uiEn from '@/content/ui/en.json'
import uiCs from '@/content/ui/cs.json'

const STORAGE_KEY = 'portfolio-locale'

const uiByLocale: Record<LocaleCode, SiteUi> = {
  en: uiEn as SiteUi,
  cs: uiCs as SiteUi,
}

function readStored(): LocaleCode {
  if (typeof localStorage === 'undefined') return 'en'
  const v = localStorage.getItem(STORAGE_KEY)
  if (v === 'cs' || v === 'en') return v
  return 'en'
}

const locale = ref<LocaleCode>(readStored())
let synced = false

function syncToDocument(code: LocaleCode) {
  if (typeof document === 'undefined') return
  document.documentElement.lang = code === 'cs' ? 'cs' : 'en'
  try {
    localStorage.setItem(STORAGE_KEY, code)
  } catch {
    /* ignore quota / private mode */
  }
}

function ensureDocumentSync() {
  if (synced || typeof window === 'undefined') return
  synced = true
  syncToDocument(locale.value)
  watch(locale, (v) => syncToDocument(v))
}

export function getSiteUi(code: LocaleCode): SiteUi {
  return uiByLocale[code]
}

export function useSiteLocale() {
  ensureDocumentSync()
  const ui = computed(() => uiByLocale[locale.value])

  function setLocale(code: LocaleCode) {
    locale.value = code
  }

  return { locale, setLocale, ui }
}
