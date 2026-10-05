// The portfolio is Thai-only: scenes get a fixed Thai context instead of the site's provider.
const value = {
  lang: 'th' as const,
  setLang: () => {},
  t: {} as Record<string, unknown>,
  l: <T,>(v: { en: T; th: T }) => v.th,
  formatDate: (iso: string) => iso,
}
export const useI18n = () => value
export type Lang = 'en' | 'th'
export type Localized<T = string> = { en: T; th: T }
