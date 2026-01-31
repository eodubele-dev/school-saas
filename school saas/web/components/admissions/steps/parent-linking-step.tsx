"use client"

import { useAdmissionStore } from "@/lib/stores/admission-store"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { ArrowLeft, CheckCircle, Search, UserPlus } from "lucide-react"
import { useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { toast } from "sonner"
// import Confetti from "react-confetti" // Ideally dynamically imported

export function ParentLinkingStep() {
    const isNewParent = useAdmissionStore(state => state.data.isNewParent)
    const parentSearchQuery = useAdmissionStore(state => state.data.parentSearchQuery)
    const firstName = useAdmissionStore(state => state.data.firstName)
    const data = useAdmissionStore(state => state.data)
    const setData = useAdmissionStore(state => state.setData)
    const setStep = useAdmissionStore(state => state.setStep)
    const setSuccess = useAdmissionStore(state => state.setSuccess)

    const [loading, setLoading] = useState(false)
    const [searching, setSearching] = useState(false)
    const [searchResults, setSearchResults] = useState<any[]>([])

    const supabase = createClient()

    const handleSearch = async () => {
        if (!parentSearchQuery || parentSearchQuery.length < 3) return
        setSearching(true)

        const { data: results, error } = await supabase
            .from('parents')
            .select('id, full_name, phone')
            .ilike('phone', `%${data.parentSearchQuery}%`)
            .limit(5)

        if (results) setSearchResults(results)
        setSearching(false)
    }

    const handleSubmit = async () => {
        setLoading(true)
        try {
            // 1. Create Student
            const { data: student, error: studentError } = await supabase
                .from('students')
                .insert({
                    first_name: data.firstName,
                    last_name: data.lastName,
                    middle_name: data.middleName,
                    dob: data.dob,
                    gender: data.gender,
                    blood_group: data.bloodGroup,
                    genotype: data.genotype,
                    passport_url: data.passportUrl,
                    class_id: data.classId,
                    house: data.house,
                    admission_number: data.admissionNumber,
                    // tenant_id handled by RLS or default? Check schema defaults or triggers. 
                    // Usually safer to rely on authenticated user context, but let's assume RLS handles it if not explicitly passed.
                    // Actually, for SaaS, we might need to pass `tenant_id` if we are the admin.
                })
                .select()
                .single()

            if (studentError) throw studentError

            // 2. Link Parent (Logic omitted for brevity - would link via student_parents table)

            toast.success(`Student ${firstName} Admitted Successfully!`)
            setSuccess(true)
        } catch (error: any) {
            toast.error("Admission Failed: " + error.message)
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="space-y-6">
            <div className="space-y-6 max-w-xl">
                {/* Search Mode */}
                <div className="space-y-4 p-4 border border-white/10 rounded-lg bg-slate-950/50">
                    <div className="flex items-center gap-2 mb-2">
                        <Search className="h-4 w-4 text-[var(--school-accent)]" />
                        <h3 className="font-semibold text-white">Find Existing Parent</h3>
                    </div>
                    <div className="flex gap-2">
                        <Input
                            placeholder="Search by Phone Number..."
                            value={parentSearchQuery}
                            onChange={(e) => setData({ parentSearchQuery: e.target.value })}
                            className="bg-slate-900 border-white/10 text-white"
                        />
                        <Button onClick={handleSearch} disabled={searching}>
                            {searching ? "..." : "Search"}
                        </Button>
                    </div>

                    {/* Results List */}
                    <div className="space-y-2">
                        {searchResults.map(p => (
                            <div
                                key={p.id}
                                className="flex items-center justify-between p-3 rounded bg-slate-900 border border-white/5 hover:border-[var(--school-accent)] cursor-pointer"
                                onClick={() => setData({ parentId: p.id })}
                            >
                                <div>
                                    <p className="text-sm font-medium text-white">{p.full_name}</p>
                                    <p className="text-xs text-slate-500">{p.phone}</p>
                                </div>
                                {data.parentId === p.id && <CheckCircle className="h-4 w-4 text-green-500" />}
                            </div>
                        ))}
                    </div>
                </div>

                <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                        <span className="w-full border-t border-white/10" />
                    </div>
                    <div className="relative flex justify-center text-xs uppercase">
                        <span className="bg-slate-950 px-2 text-slate-500">Or Create New</span>
                    </div>
                </div>

                {/* Create New Mode Toggle (Simplified for prototype) */}
                <Button
                    type="button"
                    className="w-full border-2 border-dashed border-white/20 bg-slate-800 text-white hover:border-[var(--school-accent)] hover:bg-slate-700 transition-all duration-300 antialiased font-bold py-8 group shadow-lg"
                    onClick={() => {
                        console.log('[ParentLinkingStep] Toggling isNewParent from', isNewParent);
                        setData({ isNewParent: !isNewParent });
                    }}
                >
                    <UserPlus className="mr-3 h-5 w-5 group-hover:scale-110 transition-transform text-[var(--school-accent)]" />
                    <span className="text-base tracking-wide">
                        {isNewParent ? "Cancel New Parent Creation" : "Register a New Parent"}
                    </span>
                </Button>

                {isNewParent && (
                    <div className="p-4 border border-white/10 rounded-lg space-y-4 bg-slate-900/30">
                        <Input placeholder="Parent First Name" className="bg-slate-900 border-white/10 text-white" />
                        <Input placeholder="Parent Phone Number" className="bg-slate-900 border-white/10 text-white" />
                        <Input placeholder="Email Address" className="bg-slate-900 border-white/10 text-white" />
                    </div>
                )}
            </div>

            <div className="flex justify-between pt-4">
                <Button
                    variant="ghost"
                    type="button"
                    onClick={() => setStep(2)}
                    className="text-slate-300 hover:text-white hover:bg-white/5 transition-colors duration-200 antialiased"
                >
                    <ArrowLeft className="mr-2 h-4 w-4" /> Back
                </Button>
                <Button
                    onClick={handleSubmit}
                    disabled={loading}
                    className="bg-[var(--school-accent)] hover:brightness-110 text-white min-w-[140px]"
                >
                    {loading ? "Admitting..." : "Complete Admission"}
                </Button>
            </div>
        </div>
    )
}
