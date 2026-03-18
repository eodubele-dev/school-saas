import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'

export interface EmpireSchool {
    name: string;
    slug: string;
    logo: string | null;
    role: string;
}

interface EmpireState {
    schools: EmpireSchool[];
    activeSlug: string | null;
    isInitialized: boolean;

    // Actions
    setSchools: (schools: EmpireSchool[]) => void;
    setActiveSlug: (slug: string) => void;
    addSchool: (school: EmpireSchool) => void;
}

/**
 * EmpireStore: Persistent registry of schools for Multi-School Tab Sync.
 * Remembers open institutions across sessions for Proprietors.
 */
export const useEmpireStore = create<EmpireState>()(
    persist(
        (set) => ({
            schools: [],
            activeSlug: null,
            isInitialized: false,

            setSchools: (schools) => set({ 
                schools, 
                isInitialized: true 
            }),

            setActiveSlug: (slug) => set({ activeSlug: slug }),

            addSchool: (school) => set((state) => ({
                schools: state.schools.some(s => s.slug === school.slug)
                    ? state.schools
                    : [...state.schools, school]
            })),
        }),
        {
            name: 'eduflow-empire-storage',
            storage: createJSONStorage(() => localStorage),
            partialize: (state) => ({ 
                schools: state.schools,
                activeSlug: state.activeSlug
            }),
        }
    )
)
