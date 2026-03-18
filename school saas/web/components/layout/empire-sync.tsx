"use client"

import { useEffect } from 'react'
import { useEmpireStore, EmpireSchool } from '@/lib/stores/empire-store'

interface EmpireSyncProps {
    schools: EmpireSchool[];
}

/**
 * EmpireSync: Bridges Server-Side Discovery Data to Client-Side Empire Store.
 * Automatically synchronizes the school registry for proprietors on mount.
 */
export function EmpireSync({ schools }: EmpireSyncProps) {
    const setSchools = useEmpireStore(state => state.setSchools)

    useEffect(() => {
        if (schools.length > 0) {
            setSchools(schools)
        }
    }, [schools, setSchools])

    return null; // Side-effect only component
}
