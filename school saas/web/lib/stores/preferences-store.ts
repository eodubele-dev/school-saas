import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { updateUserPreferences, type UserPreferences } from '@/lib/actions/preferences'

interface PreferencesState extends UserPreferences {
    setTheme: (theme: UserPreferences['theme']) => void
    setLanguage: (lang: string) => void
    setFontSize: (size: number) => void
    toggleFinancialPrivacy: () => void
    toggleNotification: (channel: 'in_app' | 'email' | 'sms', type: 'security' | 'academic' | 'financial' | 'emergency') => void

    // For initial hydration from DB
    hydratePreferences: (prefs: Partial<UserPreferences>) => void
}

const DEFAULT_PREFERENCES: UserPreferences = {
    theme: 'system',
    language: 'en-NG',
    font_size: 100, // percentage
    hide_financial_figures: false,
    notifications: {
        in_app: { security: true, academic: true, financial: true, emergency: true },
        email: { security: true, academic: true, financial: true, emergency: true },
        sms: { security: false, academic: false, financial: false, emergency: true }
    }
}

export const usePreferencesStore = create<PreferencesState>()(
    persist(
        (set, get) => ({
            ...DEFAULT_PREFERENCES,

            hydratePreferences: (prefs) => set((state) => ({ ...state, ...prefs })),

            setTheme: (theme) => {
                set({ theme })
                // Optimistic Update
                updateUserPreferences({ theme })
            },

            setLanguage: (language) => {
                set({ language })
                updateUserPreferences({ language })
            },

            setFontSize: (font_size) => {
                set({ font_size })
                // Debouncing might be good here, but for simplicity:
                updateUserPreferences({ font_size })
            },

            toggleFinancialPrivacy: () => {
                const newValue = !get().hide_financial_figures
                set({ hide_financial_figures: newValue })
                updateUserPreferences({ hide_financial_figures: newValue })
            },

            toggleNotification: (channel, type) => {
                // Emergency is locked
                if (type === 'emergency') return

                const currentChannel = get().notifications[channel]
                const newChannelSettings = { ...currentChannel, [type]: !currentChannel[type] }

                const newNotifications = {
                    ...get().notifications,
                    [channel]: newChannelSettings
                }

                set({ notifications: newNotifications })
                updateUserPreferences({ notifications: newNotifications })
            }
        }),
        {
            name: 'user-preferences', // local storage key
            // Partial persistence if needed, but persisting all is fine for offline-first feel
        }
    )
)
