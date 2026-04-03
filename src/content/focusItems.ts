import type { LocaleCode } from '@/locale/types'
import focusEn from './focus/en.json'
import focusCs from './focus/cs.json'
import type { FocusItem } from './types'

const byLocale = {
  en: focusEn.items as FocusItem[],
  cs: focusCs.items as FocusItem[],
}

export function getFocusItems(locale: LocaleCode): FocusItem[] {
  return byLocale[locale]
}
