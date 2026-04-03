export type LocaleCode = 'en' | 'cs'

export type SiteUi = {
  hero: {
    ariaIntroduction: string
    name: string
    role: string
    tagline: string
  }
  about: {
    heading: string
    body: string
  }
  timeline: {
    heading: string
    hint: string
    filters: {
      github: string
      education: string
      employment: string
      contract: string
    }
    scaleTitle: string
    scaleUnit: string
    empty: string
    present: string
    openDetails: string
    modalClose: string
    yearSuffix: string
  }
  focus: {
    heading: string
    hint: string
    filters: {
      backend: string
      frontend: string
      networking: string
      devops: string
      data: string
    }
    empty: string
    skillsAria: string
  }
  contact: {
    heading: string
    email: string
    github: string
    linkedin: string
    location: string
  }
  contactValues: {
    email: string
    github: string
    linkedin: string
    location: string
  }
  backdrop: {
    pause: string
    play: string
    hint: string
    ariaPause: string
    ariaResume: string
  }
  lang: {
    enLabel: string
    csLabel: string
    ariaSwitcher: string
  }
  hr: {
    toggleAria: string
    panelTitle: string
    cvLanguage: string
    printerFriendly: string
    printerFriendlyHint: string
    exportCv: string
    exportAria: string
  }
  cv: {
    documentTitleSuffix: string
    backToSite: string
    printOrSavePdf: string
    screenIntro: string
  }
}
