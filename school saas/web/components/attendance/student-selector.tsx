"use client"

import { useRouter, useSearchParams } from "next/navigation"

export function StudentSelector({ students }: { students: any[] }) {
    const router = useRouter()
    const searchParams = useSearchParams()
    const currentId = searchParams.get("studentId") || students[0]?.id

    return (
        <div className="mb-6">
            <label className="block text-xs font-medium text-slate-400 mb-2">Select Student</label>
            <select
                className="w-full max-w-sm bg-slate-900 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
                value={currentId}
                onChange={(e) => {
                    const params = new URLSearchParams(searchParams)
                    params.set("studentId", e.target.value)
                    router.push(`?${params.toString()}`)
                }}
            >
                {students.map((s) => (
                    <option key={s.id} value={s.id}>
                        {s.full_name} ({s.details})
                    </option>
                ))}
            </select>
        </div>
    )
}
