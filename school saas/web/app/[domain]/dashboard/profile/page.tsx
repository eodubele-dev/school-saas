import { createClient } from "@/lib/supabase/server"
import { headers } from "next/headers"
import {
    User,
    School,
    Calendar,
    Users,
    Phone,
    Mail,
    MapPin,
    Activity,
    Dna,
    Droplet,
    ShieldCheck,
    Edit,
    Bus
} from "lucide-react"
import { Toaster, toast } from "sonner"
import { redirect } from "next/navigation"

import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

// --- Components for Client Interaction ---
import { EditRequestButton } from "./edit-request-button"

export default async function ChildProfilePage({ params }: { params: { domain: string } }) {
    const supabase = createClient()

    // 1. Auth & Context Validation
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) redirect(`/${params.domain}/login`)

    // 2. Fetch Tenant
    const { data: tenant } = await supabase
        .from('tenants')
        .select('id, name')
        .eq('slug', params.domain)
        .single()

    if (!tenant) return <div className="p-8 text-red-500">School not found.</div>

    // 3. Fetch Parent Profile
    const { data: parentProfile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single()

    // 4. Fetch Student (Linked to Parent)
    // Note: Assuming single child for now per instructions, or taking the first one
    const { data: student } = await supabase
        .from('students')
        .select(`
            *,
            classes (
                name,
                grade_level
            )
        `)
        .eq('parent_id', user.id)
        .eq('tenant_id', tenant.id)
        .single() // Take first child

    if (!student) {
        return (
            <div className="flex h-[50vh] items-center justify-center p-8">
                <Card className="bg-slate-900/50 border-white/5 p-8 text-center backdrop-blur-md">
                    <User className="w-12 h-12 text-slate-500 mx-auto mb-4" />
                    <h2 className="text-xl font-bold text-white mb-2">No Student Linked</h2>
                    <p className="text-slate-400">Please contact the school admin to link your child's account.</p>
                </Card>
            </div>
        )
    }

    // 5. Mock Data (for missing schema fields)
    const MOCK_DATA = {
        studentId: student.id.slice(0, 8).toUpperCase(), // Generate pseudo-ID
        dob: "12th Oct, 2013",
        gender: "Male", // Default
        bloodGroup: "O+",
        genotype: "AA",
        admissionDate: "Sept 2022",
        house: "Aggrey House",
        club: "Jet Club",
        secondaryContact: "+234 809 123 4567"
    }

    return (
        <div className="space-y-8 animate-in fade-in duration-500 pb-20">
            {/* Page Header */}
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight text-white glow-blue font-serif">Child Profile</h2>
                    <p className="text-slate-400">View and manage student information.</p>
                </div>
                <EditRequestButton />
            </div>

            {/* Digital ID Card Section */}
            <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-cyan-950/20 to-slate-950 border border-cyan-500/20 p-8 md:p-12 shadow-[0_0_50px_rgba(6,182,212,0.05)]">
                {/* Background Decor */}
                <div className="absolute top-0 right-0 w-64 h-64 bg-cyan-500/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />

                <div className="flex flex-col md:flex-row items-center gap-8 relative z-10">
                    {/* Left: Photo */}
                    <div className="relative group">
                        <div className="h-32 w-32 md:h-40 md:w-40 rounded-full border-[3px] border-cyan-500/30 p-1 shadow-[0_0_30px_rgba(6,182,212,0.2)] bg-slate-950/50 backdrop-blur-sm">
                            <div className="h-full w-full rounded-full bg-slate-800 flex items-center justify-center overflow-hidden relative">
                                <User className="h-16 w-16 text-slate-600" />
                                {/* Placeholder for real image */}
                                {/* <Image src={student.photo_url} fill className="object-cover" /> */}
                            </div>
                        </div>
                        <div className="absolute bottom-2 right-2 h-8 w-8 bg-cyan-500 rounded-full flex items-center justify-center shadow-lg border-2 border-slate-950" title="Active Student">
                            <ShieldCheck className="h-4 w-4 text-slate-950" />
                        </div>
                    </div>

                    {/* Right: Info */}
                    <div className="text-center md:text-left space-y-2">
                        <h1 className="text-3xl md:text-4xl font-bold text-white font-serif tracking-tight">
                            {student.full_name}
                        </h1>
                        <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 text-sm">
                            <Badge variant="outline" className="border-cyan-500/30 text-cyan-400 bg-cyan-950/20 px-3 py-1">
                                ID: {MOCK_DATA.studentId}
                            </Badge>
                            <Badge variant="outline" className="border-white/10 text-slate-300 bg-white/5 px-3 py-1">
                                {student.classes?.name || "Unassigned"}
                            </Badge>
                            <span className="text-slate-500 flex items-center gap-1">
                                <School className="h-3 w-3" />
                                {tenant.name}
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Information Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

                {/* 1. Personal Details */}
                <Card className="bg-slate-900/40 border-white/5 backdrop-blur-sm hover:border-cyan-500/20 transition-all duration-300 group">
                    <div className="p-6 space-y-6">
                        <div className="flex items-center gap-3 border-b border-white/5 pb-4">
                            <div className="p-2 rounded-lg bg-blue-500/10 text-blue-400 group-hover:bg-blue-500/20 transition-colors">
                                <User className="h-5 w-5" />
                            </div>
                            <h3 className="font-bold text-white tracking-wide">Personal Details</h3>
                        </div>
                        <div className="space-y-4">
                            <InfoRow label="Full Name" value={student.full_name} />
                            <InfoRow label="Date of Birth" value={MOCK_DATA.dob} icon={Calendar} />
                            <InfoRow label="Gender" value={MOCK_DATA.gender} icon={Users} />
                            <div className="grid grid-cols-2 gap-4 pt-2">
                                <BoxInfo label="Blood Group" value={MOCK_DATA.bloodGroup} icon={Droplet} color="text-red-400" bg="bg-red-500/10" />
                                <BoxInfo label="Genotype" value={MOCK_DATA.genotype} icon={Dna} color="text-purple-400" bg="bg-purple-500/10" />
                            </div>
                        </div>
                    </div>
                </Card>

                {/* 2. Academic Info */}
                <Card className="bg-slate-900/40 border-white/5 backdrop-blur-sm hover:border-cyan-500/20 transition-all duration-300 group">
                    <div className="p-6 space-y-6">
                        <div className="flex items-center gap-3 border-b border-white/5 pb-4">
                            <div className="p-2 rounded-lg bg-cyan-500/10 text-cyan-400 group-hover:bg-cyan-500/20 transition-colors">
                                <School className="h-5 w-5" />
                            </div>
                            <h3 className="font-bold text-white tracking-wide">Academic Info</h3>
                        </div>
                        <div className="space-y-4">
                            <InfoRow label="Admission Date" value={MOCK_DATA.admissionDate} />
                            <InfoRow label="Current Class" value={student.classes?.name} />
                            <InfoRow label="School House" value={MOCK_DATA.house} highlight />
                            <InfoRow label="Bus Route" value="Route 5 - Lekki Axis" icon={Bus} />
                        </div>
                    </div>
                </Card>

                {/* 3. Guardians & Health Info */}
                <Card className="bg-slate-900/40 border-white/5 backdrop-blur-sm hover:border-cyan-500/20 transition-all duration-300 group">
                    <div className="p-6 space-y-4">
                        <div className="flex items-center gap-3 border-b border-white/5 pb-4">
                            <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400 group-hover:bg-emerald-500/20 transition-colors">
                                <ShieldCheck className="h-5 w-5" />
                            </div>
                            <h3 className="font-bold text-white tracking-wide">Guardian & Heath</h3>
                        </div>

                        {/* Health Alert Section */}
                        <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-3 flex gap-3 items-start">
                            <Activity className="h-5 w-5 text-red-500 shrink-0 mt-0.5" />
                            <div>
                                <p className="text-xs font-bold text-red-400 uppercase tracking-wider">Health Alert</p>
                                <p className="text-sm text-slate-300">Asthma - Inhaler required.</p>
                            </div>
                        </div>

                        <div className="space-y-3 pt-2">
                            <div className="bg-white/5 rounded-lg p-3 border border-white/5">
                                <p className="text-xs text-slate-500 uppercase tracking-wider font-bold mb-1">Primary Contact</p>
                                <p className="text-white font-medium text-sm">{parentProfile?.full_name}</p>
                                <div className="flex items-center gap-2 text-xs text-slate-400 mt-1">
                                    <Mail className="h-3 w-3" />
                                    {user.email}
                                </div>
                            </div>
                        </div>
                    </div>
                </Card>
            </div>

            {/* Premium Footer Branding */}
            <div className="pt-8 text-center">
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-slate-900/50 border border-white/5 text-xs font-medium text-slate-500 uppercase tracking-widest shadow-2xl">
                    <ShieldCheck className="h-3 w-3 text-cyan-500" />
                    EduFlow Platinum Edition • Secure Academic Record
                </div>
            </div>
        </div>
    )
}

// --- Helper Components ---

function InfoRow({ label, value, icon: Icon, highlight = false }: { label: string, value: string | undefined, icon?: any, highlight?: boolean }) {
    return (
        <div className="flex justify-between items-center text-sm group/row">
            <span className="text-slate-500 flex items-center gap-2">
                {Icon && <Icon className="h-3.5 w-3.5 opacity-70" />}
                {label}
            </span>
            <span className={`font-medium ${highlight ? 'text-cyan-400' : 'text-slate-300'}`}>
                {value || "N/A"}
            </span>
        </div>
    )
}

function BoxInfo({ label, value, icon: Icon, color, bg }: { label: string, value: string, icon: any, color: string, bg: string }) {
    return (
        <div className={`rounded-xl p-3 border border-white/5 flex flex-col items-center justify-center gap-1 ${bg}`}>
            <Icon className={`h-4 w-4 mb-1 ${color}`} />
            <span className="text-[10px] uppercase tracking-wider text-slate-400 font-bold">{label}</span>
            <span className="text-lg font-bold text-white">{value}</span>
        </div>
    )
}
