import { useAdmissionStore } from "@/lib/stores/admission-store"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { ArrowLeft, CheckCircle, Search, UserPlus, AlertTriangle } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog"
import { useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { toast } from "sonner"
import { admitStudent } from "@/lib/actions/onboarding"
import { verifyAdmissionClearance } from "@/lib/actions/debt-network"

export function ParentLinkingStep() {
    const isNewParent = useAdmissionStore(state => state.data.isNewParent)
    const parentSearchQuery = useAdmissionStore(state => state.data.parentSearchQuery)
    const data = useAdmissionStore(state => state.data)
    const setData = useAdmissionStore(state => state.setData)
    const setStep = useAdmissionStore(state => state.setStep)
    const setSuccess = useAdmissionStore(state => state.setSuccess)

    const [loading, setLoading] = useState(false)
    const [searching, setSearching] = useState(false)
    const [searchResults, setSearchResults] = useState<any[]>([])

    // Debt Network States
    const [debtWarning, setDebtWarning] = useState<{ isWarning: boolean, type: string | null, details: any }>({ isWarning: false, type: null, details: null })
    const [bypassDebtFlag, setBypassDebtFlag] = useState(false)

    const supabase = createClient()

    const handleSearch = async () => {
        if (!parentSearchQuery || parentSearchQuery.length < 3) return
        setSearching(true)

        const { data: results, error } = await supabase
            .from('profiles') // Changed from 'parents' to 'profiles' assuming parents are in profiles table with role='parent'
            .select('id, full_name, phone')
            .eq('role', 'parent')
            .or(`phone.ilike.%${data.parentSearchQuery}%,full_name.ilike.%${data.parentSearchQuery}%`)
            .limit(5)

        if (error) {
            toast.error("Failed to connect to parent database: " + error.message)
        } else if (results) {
            setSearchResults(results)
        }
        setSearching(false)
    }

    const handleSubmit = async () => {
        if (!data.parentId && !data.parentData?.phone) {
            toast.error("Please select an existing parent or fill in new parent details")
            return
        }

        setLoading(true)

        // Pre-Flight Debt Clearance Check (only run if warning hasn't been shown and bypassed)
        if (!debtWarning.isWarning) {
            try {
                const phone = data.parentData?.phone || searchResults.find(p => p.id === data.parentId)?.phone || ""
                const email = data.parentData?.email || ""
                const pName = data.parentData?.lastName ? `${data.parentData.firstName} ${data.parentData.lastName}` : (searchResults.find(p => p.id === data.parentId)?.full_name || "")
                const sName = `${data.firstName || ''} ${data.lastName || ''}`.trim()

                const clearance = await verifyAdmissionClearance(phone, email, sName, pName)

                if (clearance?.warning) {
                    setDebtWarning({
                        isWarning: true,
                        type: clearance.data?.confidence || 'unknown',
                        details: clearance.data
                    })
                    setLoading(false)
                    toast.warning("Global Debt Alert Network flag detected! Please review.")
                    return // Halts admission 
                }
            } catch (err) {
                console.error("Debt check failed, allowing admission to proceed smoothly.", err)
            }
        }

        // If warning is active BUT they haven't explicitly checked the bypass box
        if (debtWarning.isWarning && !bypassDebtFlag) {
            toast.error("You must explicitly acknowledge the debt risk to proceed.")
            setLoading(false)
            return
        }

        try {
            const res = await admitStudent({
                firstName: data.firstName,
                lastName: data.lastName,
                middleName: data.middleName,
                gender: data.gender,
                dob: data.dob || new Date().toISOString(),
                classId: data.classId,
                house: data.house,
                admissionNumber: data.admissionNumber,
                parentId: data.parentId || undefined,
                parentPhone: data.parentData?.phone || "",
                parentEmail: data.parentData?.email,
                parentName: data.parentData?.firstName ? `${data.parentData.firstName} ${data.parentData.lastName}` : undefined,
                bloodGroup: data.bloodGroup,
                genotype: data.genotype,
                passportUrl: data.passportUrl || undefined
            })

            if (res.success) {
                toast.success(res.message)
                setSuccess(true)
            } else {
                toast.error("Admission Failed: " + res.error)
            }
        } catch (error: any) {
            console.error('[ParentLinkingStep] Submission Error:', error)
            toast.error("System Error: " + (error.message || "Unknown error"))
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="space-y-6">
            <div className="space-y-6 max-w-xl">
                {/* Search Mode */}
                <div className="space-y-4 p-4 border border-border rounded-lg bg-slate-950/50">
                    <div className="flex items-center gap-2 mb-2">
                        <Search className="h-4 w-4 text-[var(--school-accent)]" />
                        <h3 className="font-semibold text-foreground">Find Existing Parent</h3>
                    </div>
                    <div className="flex gap-2">
                        <Input
                            placeholder="Search by Parent Name or Phone Number..."
                            value={parentSearchQuery}
                            onChange={(e) => setData({ parentSearchQuery: e.target.value })}
                            className="bg-card text-card-foreground border-border text-foreground"
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
                                className="flex items-center justify-between p-3 rounded bg-card text-card-foreground border border-border/50 hover:border-[var(--school-accent)] cursor-pointer"
                                onClick={() => setData({
                                    parentId: p.id,
                                    // Store phone as well for the server action
                                    parentData: {
                                        ...data.parentData,
                                        phone: p.phone,
                                        firstName: p.full_name?.split(' ')[0] || '',
                                        lastName: p.full_name?.split(' ').slice(1).join(' ') || '',
                                        email: '',
                                        address: ''
                                    }
                                })}
                            >
                                <div>
                                    <p className="text-sm font-medium text-foreground">{p.full_name}</p>
                                    <p className="text-xs text-muted-foreground">{p.phone}</p>
                                </div>
                                {data.parentId === p.id && <CheckCircle className="h-4 w-4 text-green-500" />}
                            </div>
                        ))}
                    </div>
                </div>

                <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                        <span className="w-full border-t border-border" />
                    </div>
                    <div className="relative flex justify-center text-xs uppercase">
                        <span className="bg-slate-950 px-2 text-muted-foreground">Or Create New</span>
                    </div>
                </div>

                {/* Create New Mode Toggle */}
                {!debtWarning.isWarning && (
                    <Button
                        type="button"
                        className="w-full border-2 border-dashed border-white/20 bg-slate-800 text-foreground hover:border-[var(--school-accent)] hover:bg-slate-700 transition-all duration-300 antialiased font-bold py-8 group shadow-lg"
                        onClick={() => {
                            setData({ isNewParent: !isNewParent, parentId: null });
                        }}
                    >
                        <UserPlus className="mr-3 h-5 w-5 group-hover:scale-110 transition-transform text-[var(--school-accent)]" />
                        <span className="text-base tracking-wide">
                            {isNewParent ? "Cancel New Parent Creation" : "Register a New Parent"}
                        </span>
                    </Button>
                )}

                {isNewParent && (
                    <div className="p-4 border border-border rounded-lg space-y-4 bg-card text-card-foreground/30">
                        <Input
                            placeholder="Parent First Name"
                            className="bg-card text-card-foreground border-border text-foreground"
                            value={data.parentData?.firstName || ''}
                            onChange={(e) => setData({ parentData: { ...data.parentData!, firstName: e.target.value } })}
                        />
                        <Input
                            placeholder="Parent Last Name"
                            className="bg-card text-card-foreground border-border text-foreground"
                            value={data.parentData?.lastName || ''}
                            onChange={(e) => setData({ parentData: { ...data.parentData!, lastName: e.target.value } })}
                        />
                        <Input
                            placeholder="Parent Phone Number"
                            className="bg-card text-card-foreground border-border text-foreground"
                            value={data.parentData?.phone || ''}
                            onChange={(e) => setData({ parentData: { ...data.parentData!, phone: e.target.value } })}
                        />
                        <Input
                            placeholder="Email Address"
                            className="bg-card text-card-foreground border-border text-foreground"
                            value={data.parentData?.email || ''}
                            onChange={(e) => setData({ parentData: { ...data.parentData!, email: e.target.value } })}
                        />
                    </div>
                )}

                {/* Debt Network Warning Dialog Modal */}
                <Dialog open={debtWarning.isWarning} onOpenChange={(open) => {
                    if (!open) setDebtWarning({ ...debtWarning, isWarning: false })
                }}>
                    <DialogContent className="sm:max-w-md bg-slate-950 border-red-900 border-2 shadow-2xl">
                        <DialogHeader>
                            <DialogTitle className="flex items-center gap-3 text-red-500 text-xl font-black uppercase tracking-wider">
                                <AlertTriangle className="h-7 w-7 animate-pulse" />
                                HIGH ALERT: Debt Flag Found
                            </DialogTitle>
                            <DialogDescription className="text-red-200/80 pt-3 text-base leading-relaxed font-medium">
                                The Global Debt Alert System has found a <strong className="text-red-400">{debtWarning.type === 'high' ? 'High Confidence (Direct Contact Match)' : 'Medium Confidence (Fuzzy match)'}</strong> record linking this family to an outstanding fee at another institution.
                            </DialogDescription>
                        </DialogHeader>
                        
                        <div className="pt-4 pb-2">
                            <label className="flex items-start gap-4 p-4 bg-red-950/40 border border-red-500/30 rounded-xl cursor-pointer hover:bg-red-900/40 transition-colors">
                                <input
                                    type="checkbox"
                                    className="mt-1 h-5 w-5 rounded border-red-500/50 bg-slate-900 accent-red-600 shrink-0"
                                    checked={bypassDebtFlag}
                                    onChange={(e) => setBypassDebtFlag(e.target.checked)}
                                />
                                <span className="text-sm text-red-100 font-semibold leading-snug">
                                    I acknowledge this global debt warning and assume full financial responsibility for admitting this student.
                                </span>
                            </label>
                        </div>
                        
                        <DialogFooter className="sm:justify-between pt-2">
                            <Button
                                type="button"
                                variant="ghost"
                                onClick={() => setDebtWarning({ ...debtWarning, isWarning: false })}
                                className="text-slate-400 hover:text-white hover:bg-slate-800"
                            >
                                Cancel Admission
                            </Button>
                            <Button 
                                type="button" 
                                onClick={handleSubmit} 
                                disabled={!bypassDebtFlag || loading}
                                className="bg-red-600 hover:bg-red-500 text-white font-bold shadow-lg shadow-red-900/20"
                            >
                                {loading ? "Processing..." : "Proceed Anyway"}
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>

            <div className="flex justify-between pt-4">
                <Button
                    variant="ghost"
                    type="button"
                    onClick={() => setStep(2)}
                    className="text-slate-300 hover:text-foreground hover:bg-secondary/50 transition-colors duration-200 antialiased"
                >
                    <ArrowLeft className="mr-2 h-4 w-4" /> Back
                </Button>
                <Button
                    onClick={handleSubmit}
                    disabled={loading}
                    className="bg-[var(--school-accent)] hover:brightness-110 text-foreground min-w-[140px]"
                >
                    {loading ? "Admitting..." : "Complete Admission"}
                </Button>
            </div>
        </div>
    )
}
