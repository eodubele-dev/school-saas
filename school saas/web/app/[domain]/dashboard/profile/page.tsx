import { createClient } from "@/lib/supabase/server"
import { headers } from "next/headers"
import { unstable_noStore as noStore } from 'next/cache'

export const dynamic = 'force-dynamic'
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
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

// --- Components for Client Interaction ---
import { EditRequestButton } from "./edit-request-button"
import { ProfileEditDialog } from "@/components/profile-edit-dialog"

import { format } from "date-fns"

export default async function ChildProfilePage({ 
    params, 
    searchParams 
}: { 
    params: { domain: string }, 
    searchParams: { studentId?: string } 
}) {
    noStore()
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

    // 3. Fetch Parent/User Profile
    const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single()

    // 4. Role-Based Data Fetching
    const userRole = profile?.role || 'user'
    const isParent = userRole === 'parent'
    const studentIdParam = searchParams?.studentId

    let student = null

    if (isParent) {
        let query = supabase
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

        // If a specific student is selected via switcher (URL param), fetch that one
        if (studentIdParam) {
            query = query.eq('id', studentIdParam)
        }

        const { data: students } = await query
        student = students?.[0] || null
    }

    // 5. Render Logic

    // CASE A: PARENT with NO STUDENT
    if (isParent && !student) {
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

    // CASE B: STAFF / ADMIN / STUDENT (Using Personal Profile)
    if (!isParent) {
        return (
            <div className="space-y-8 animate-in fade-in duration-500 pb-20">
                {/* Page Header */}
                <div className="flex justify-between items-center">
                    <div>
                        <h2 className="text-3xl font-bold tracking-tight text-white glow-blue">My Profile</h2>
                        <p className="text-slate-400">Manage your personal information and security settings.</p>
                    </div>
                    {/* EDIT DIALOG */}
                    <ProfileEditDialog profile={{ ...profile, email: user.email }} />
                </div>

                {/* Digital ID Card Section - STAFF VERSION */}
                <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-indigo-950/20 to-slate-950 border border-indigo-500/20 p-8 md:p-12 shadow-[0_0_50px_rgba(99,102,241,0.05)]">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />

                    <div className="flex flex-col md:flex-row items-center gap-8 relative z-10">
                        {/* Photo */}
                        <div className="relative group">
                            <div className="h-32 w-32 md:h-40 md:w-40 rounded-full border-[3px] border-indigo-500/30 p-1 shadow-[0_0_30px_rgba(99,102,241,0.2)] bg-slate-950/50 backdrop-blur-sm">
                                <div className="h-full w-full rounded-full bg-slate-800 flex items-center justify-center overflow-hidden relative">
                                    <Avatar className="h-full w-full">
                                        <AvatarImage src={profile?.avatar_url} className="object-cover" />
                                        <AvatarFallback className="bg-slate-800 flex items-center justify-center h-full w-full">
                                            <User className="h-16 w-16 text-slate-600" />
                                        </AvatarFallback>
                                    </Avatar>
                                </div>
                            </div>
                            <div className="absolute bottom-2 right-2 h-8 w-8 bg-indigo-500 rounded-full flex items-center justify-center shadow-lg border-2 border-slate-950" title="Verified Staff">
                                <ShieldCheck className="h-4 w-4 text-slate-950" />
                            </div>
                        </div>

                        {/* Info */}
                        <div className="text-center md:text-left space-y-2">
                            <h1 className="text-3xl md:text-4xl font-bold text-white tracking-tight">
                                {profile?.full_name || "Staff Member"}
                            </h1>
                            <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 text-sm">
                                <Badge variant="outline" className="border-indigo-500/30 text-indigo-400 bg-indigo-950/20 px-3 py-1 uppercase tracking-wider">
                                    {userRole}
                                </Badge>
                                <span className="text-slate-500 flex items-center gap-1">
                                    <School className="h-3 w-3" />
                                    {tenant.name}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Info Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Card className="bg-slate-900/40 border-white/5 backdrop-blur-sm group">
                        <div className="p-6 space-y-6">
                            <div className="flex items-center gap-3 border-b border-white/5 pb-4">
                                <div className="p-2 rounded-lg bg-blue-500/10 text-blue-400">
                                    <User className="h-5 w-5" />
                                </div>
                                <h3 className="font-bold text-white tracking-wide">Account Details</h3>
                            </div>
                            <div className="space-y-4">
                                <InfoRow label="Full Name" value={profile?.full_name} />
                                <InfoRow label="Email Address" value={user.email} icon={Mail} />
                                <InfoRow label="User ID" value={user.id.slice(0, 8).toUpperCase()} icon={Dna} />
                                <InfoRow label="Role" value={userRole} icon={ShieldCheck} highlight />
                            </div>
                        </div>
                    </Card>

                    <Card className="bg-slate-900/40 border-white/5 backdrop-blur-sm group">
                        <div className="p-6 space-y-6">
                            <div className="flex items-center gap-3 border-b border-white/5 pb-4">
                                <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400">
                                    <Activity className="h-5 w-5" />
                                </div>
                                <h3 className="font-bold text-white tracking-wide">System Status</h3>
                            </div>
                            <div className="space-y-4">
                                <div className="flex items-center justify-between text-sm">
                                    <span className="text-slate-500">Account Status</span>
                                    <span className="text-emerald-400 font-medium flex items-center gap-2">
                                        <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                                        Active
                                    </span>
                                </div>
                                <InfoRow label="Last Login" value="Just Now" icon={Calendar} />
                                <InfoRow label="School" value={tenant.name} icon={School} />
                            </div>
                        </div>
                    </Card>
                </div>
            </div>
        )
    }

    // CASE C: PARENT with CHILD (Production Ready)
    const displayDob = student.date_of_birth ? format(new Date(student.date_of_birth), "do MMM, yyyy") : "N/A"
    const displayAdmissionDate = student.admission_date ? format(new Date(student.admission_date), "MMM yyyy") : "N/A"

    return (
        <div className="space-y-8 animate-in fade-in duration-500 pb-20">
            {/* Page Header */}
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight text-white glow-blue">Child Profile</h2>
                    <p className="text-slate-400">View information for {student.full_name}.</p>
                </div>
                <EditRequestButton studentId={student.id} />
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
                                <Avatar className="h-full w-full">
                                    <AvatarImage src={student.passport_url} className="object-cover" />
                                    <AvatarFallback className="bg-slate-800 flex items-center justify-center h-full w-full">
                                        <User className="h-16 w-16 text-slate-600" />
                                    </AvatarFallback>
                                </Avatar>
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
                                ADM: {student.admission_number || "N/A"}
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
                            <InfoRow label="Date of Birth" value={displayDob} icon={Calendar} />
                            <InfoRow label="Gender" value={student.gender} icon={Users} />
                            <div className="grid grid-cols-2 gap-4 pt-2">
                                <BoxInfo label="Blood Group" value={student.blood_group || "N/A"} icon={Droplet} color="text-red-400" bg="bg-red-500/10" />
                                <BoxInfo label="Genotype" value={student.genotype || "N/A"} icon={Dna} color="text-purple-400" bg="bg-purple-500/10" />
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
                            <InfoRow label="Admission Date" value={displayAdmissionDate} />
                            <InfoRow label="Current Class" value={student.classes?.name} />
                            <InfoRow label="School House" value={student.house} highlight icon={ShieldCheck} />
                            <InfoRow label="Assigned Club" value={student.club} icon={Activity} />
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
                            <h3 className="font-bold text-white tracking-wide">Guardian & Info</h3>
                        </div>

                        <div className="space-y-3 pt-2">
                            <div className="bg-white/5 rounded-lg p-4 border border-white/5 hover:border-cyan-500/10 transition-colors">
                                <p className="text-xs text-slate-500 uppercase tracking-wider font-bold mb-1">Parental Context</p>
                                <p className="text-white font-medium text-sm">{profile?.full_name}</p>
                                <div className="flex items-center gap-2 text-xs text-slate-400 mt-1">
                                    <Mail className="h-3 w-3" />
                                    {user.email}
                                </div>
                            </div>
                        </div>

                        <div className="bg-cyan-500/5 border border-cyan-500/10 rounded-lg p-3 mt-4">
                            <p className="text-[10px] text-cyan-400 uppercase font-bold tracking-widest mb-1">Data Security</p>
                            <p className="text-[11px] text-slate-400 leading-tight">This profile is restricted to authorized school personnel and verified guardians.</p>
                        </div>
                    </div>
                </Card>
            </div>

            {/* Premium Footer Branding */}
            <div className="pt-8 text-center">
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-slate-900/50 border border-white/5 text-xs font-medium text-slate-500 uppercase tracking-widest shadow-2xl hover:text-cyan-400 transition-colors">
                    <ShieldCheck className="h-3 w-3 text-cyan-500" />
                    EduFlow Platinum Edition • Verified Identity
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
