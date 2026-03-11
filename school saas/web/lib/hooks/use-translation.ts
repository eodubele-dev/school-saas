import { usePreferencesStore } from "@/lib/stores/preferences-store"
import { dictionaries, Locale, TranslationKey } from "@/lib/i18n/dictionaries"

export function useTranslation() {
    const { language } = usePreferencesStore()

    // Fallback to en-NG if the locale isn't found
    const currentLocale = (dictionaries[language as Locale] ? language : 'en-NG') as Locale

    const dic = dictionaries[currentLocale]

    const t = (key: TranslationKey | string, fallback?: string): string => {
        return (dic as Record<string, string>)[key] || fallback || key
    }

    return { t, locale: currentLocale }
}
