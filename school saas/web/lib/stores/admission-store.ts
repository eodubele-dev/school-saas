import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export type AdmissionData = {
    // Biodata
    firstName: string
    lastName: string
    middleName: string
    dob: string | undefined
    gender: string
    bloodGroup: string
    genotype: string
    passportUrl: string | null

    // Academic
    classId: string
    house: string
    admissionNumber: string

    // Parent
    parentId: string | null
    parentSearchQuery: string
    isNewParent: boolean
    parentData?: {
        firstName: string
        lastName: string
        phone: string
        email: string
        address: string
    }
}

type AdmissionState = {
    step: number
    data: AdmissionData
    isBulkMode: boolean
    isSuccess: boolean
    setStep: (step: number) => void
    setData: (updates: Partial<AdmissionData>) => void
    setBulkMode: (isBulk: boolean) => void
    setSuccess: (isSuccess: boolean) => void
    reset: () => void
}

const initialData: AdmissionData = {
    firstName: '',
    lastName: '',
    middleName: '',
    dob: undefined,
    gender: '',
    bloodGroup: '',
    genotype: '',
    passportUrl: null,
    classId: '',
    house: '',
    admissionNumber: '',
    parentId: null,
    parentSearchQuery: '',
    isNewParent: false
}

export const useAdmissionStore = create<AdmissionState>()(
    persist(
        (set) => ({
            step: 1,
            data: initialData,
            isBulkMode: false,
            isSuccess: false,
            setStep: (step) => set({ step }),
            setData: (updates) => set((state) => ({ data: { ...state.data, ...updates } })),
            setBulkMode: (isBulk) => set({ isBulkMode: isBulk }),
            setSuccess: (isSuccess) => set({ isSuccess }),
            reset: () => set({ step: 1, data: initialData, isBulkMode: false, isSuccess: false })
        }),
        {
            name: 'admission-storage',
            partialize: (state) => ({
                step: state.step,
                data: state.data,
                isBulkMode: state.isBulkMode,
                isSuccess: state.isSuccess
            }),
        }
    )
)
