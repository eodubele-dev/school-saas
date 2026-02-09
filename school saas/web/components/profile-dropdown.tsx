"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { LogOut, User, Settings, Shield, CreditCard, BookOpen, GraduationCap, Users } from "lucide-react"
import { logout } from "@/app/actions/auth"
import { useState } from "react"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { PreferencesModal } from "@/components/preferences-modal"

interface ProfileDropdownProps {
    userName: string
    userRole: string
    userEmail?: string
    userAvatarUrl?: string | null
    userId?: string // Added for Identity Command Card
    className?: string
}

export function ProfileDropdown({ userName, userRole, userEmail, userAvatarUrl, userId, className }: ProfileDropdownProps) {
    const router = useRouter()
    const [preferencesOpen, setPreferencesOpen] = useState(false)

    const handleLogout = async () => {
        try {
            await logout()
        } catch (error) {
            console.error("Logout failed", error)
        } finally {
            router.push('/login')
        }
    }

    const getRoleConfig = (role: string) => {
        const r = role.toUpperCase()
        switch (r) {
            case 'ADMIN':
            case 'OWNER':
            case 'PROPRIETOR':
                return { color: 'text-amber-500', bg: 'bg-amber-500/10', border: 'border-amber-500/20', label: 'SYSTEM_OWNER' }
            case 'BURSAR':
                return { color: 'text-cyan-400', bg: 'bg-cyan-400/10', border: 'border-cyan-400/20', label: 'BURSARY_CHIEF' }
            case 'TEACHER':
                return { color: 'text-purple-400', bg: 'bg-purple-400/10', border: 'border-purple-400/20', label: 'EDUCATOR' }
            case 'PARENT':
                return { color: 'text-emerald-400', bg: 'bg-emerald-400/10', border: 'border-emerald-400/20', label: 'PARENT_ACCESS' }
            default:
                return { color: 'text-indigo-400', bg: 'bg-indigo-400/10', border: 'border-indigo-400/20', label: 'STUDENT_PORTAL' }
        }
    }

    const config = getRoleConfig(userRole)
    const initials = userName.charAt(0).toUpperCase()

    return (
        <>
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <div className={`flex items-center gap-3 pl-4 border-l border-white/10 cursor-pointer group select-none ${className}`}>
                        {/* Desktop View: Name & Role */}
                        <div className="text-right hidden md:block">
                            <div className="text-sm font-bold text-slate-200 leading-tight group-hover:text-white transition-colors max-w-[150px] truncate">
                                {userName}
                            </div>
                            <div className={`text-[9px] font-black mt-0.5 uppercase tracking-widest ${config.color}`}>
                                {config.label}
                            </div>
                        </div>

                        {/* Avatar */}
                        <div className={`h-9 w-9 rounded-full ${config.bg} ${config.border} border flex items-center justify-center text-sm font-bold shadow-inner group-hover:ring-2 ring-white/10 transition-all overflow-hidden`}>
                            {userAvatarUrl ? (
                                <img src={userAvatarUrl} alt={userName} className="h-full w-full object-cover" />
                            ) : (
                                <span className={config.color}>{initials}</span>
                            )}
                        </div>
                    </div>
                </DropdownMenuTrigger>

                <DropdownMenuContent className="w-72 bg-[#0A0A0B] border border-white/10 rounded-2xl shadow-2xl p-0 overflow-hidden" align="end" forceMount>
                    {/* 👤 Identity Header */}
                    <div className="p-5 border-b border-white/5 relative overflow-hidden">
                        {/* Background Glow */}
                        <div className={`absolute top-0 right-0 w-32 h-32 ${config.bg} blur-[50px] opacity-20 pointer-events-none rounded-full transform translate-x-10 -translate-y-10`} />

                        <div className="flex items-center gap-4 mb-3 relative z-10">
                            <div className={`w-12 h-12 rounded-full ${config.bg} ${config.border} border flex items-center justify-center font-bold text-lg shadow-lg`}>
                                {userAvatarUrl ? (
                                    <img src={userAvatarUrl} alt={userName} className="h-full w-full object-cover rounded-full" />
                                ) : (
                                    <span className={config.color}>{initials}</span>
                                )}
                            </div>
                            <div>
                                <p className="text-sm font-bold text-white leading-none">{userName}</p>
                                <p className="text-[10px] text-slate-500 font-mono mt-1.5 flex items-center gap-1">
                                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block animate-pulse" />
                                    ID: {userId ? userId.split('-')[0].toUpperCase() : 'UNKNOWN'}
                                </p>
                            </div>
                        </div>
                        <div className="flex items-center justify-between">
                            <span className={`text-[9px] font-black px-2.5 py-1 rounded-full ${config.bg} ${config.color} border ${config.border} uppercase tracking-widest`}>
                                {config.label}
                            </span>
                            {/* Optional: Add connection status or mini-sparkline here if needed */}
                        </div>
                    </div>

                    {/* 🔗 Dynamic Links */}
                    <div className="p-2 space-y-1">
                        <DropdownLink href="/dashboard/profile" icon={<User size={14} />} label="My Profile" />

                        {(userRole === 'PROPRIETOR' || userRole === 'ADMIN' || userRole === 'OWNER') && (
                            <DropdownLink href="/dashboard/admin/audit" icon={<Shield size={14} />} label="Security & Audit" color="text-amber-500" />
                        )}

                        {userRole === 'BURSAR' && (
                            <DropdownLink href="/dashboard/finance" icon={<CreditCard size={14} />} label="Wallet & Ledger" color="text-cyan-400" />
                        )}

                        {(userRole === 'TEACHER' || userRole === 'STUDENT') && (
                            <DropdownLink href="/dashboard/academics" icon={<BookOpen size={14} />} label="Curriculum Sync" />
                        )}

                        {userRole === 'PARENT' && (
                            <DropdownLink href="/dashboard/family" icon={<Users size={14} />} label="Switch Child Account" color="text-emerald-400" />
                        )}

                        <DropdownMenuItem
                            className="w-full flex items-center gap-3 px-4 py-2.5 rounded-lg hover:bg-white/5 transition-all cursor-pointer focus:bg-white/5"
                            onSelect={() => setPreferencesOpen(true)}
                        >
                            <Settings size={14} className="text-slate-400" />
                            <span className="text-xs font-medium text-slate-300">Preferences</span>
                        </DropdownMenuItem>
                    </div>

                    {/* 🚪 Logout */}
                    <div className="p-2 border-t border-white/5">
                        <button
                            onClick={handleLogout}
                            className="w-full flex items-center gap-3 px-4 py-2.5 text-red-500 hover:bg-red-500/10 rounded-lg transition-all group"
                        >
                            <LogOut size={14} className="group-hover:translate-x-0.5 transition-transform" />
                            <span className="text-xs font-bold uppercase tracking-widest">Terminate_Session</span>
                        </button>
                    </div>
                </DropdownMenuContent>
            </DropdownMenu>

            <PreferencesModal open={preferencesOpen} onOpenChange={setPreferencesOpen} />
        </>
    )
}

interface DropdownLinkProps {
    href: string
    icon: React.ReactNode
    label: string
    color?: string
}

function DropdownLink({ href, icon, label, color = "text-slate-400" }: DropdownLinkProps) {
    return (
        <DropdownMenuItem asChild>
            <Link href={href} className="w-full flex items-center gap-3 px-4 py-2.5 rounded-lg hover:bg-white/5 transition-all text-left cursor-pointer focus:bg-white/5">
                <span className={color}>{icon}</span>
                <span className="text-xs font-medium text-slate-300">{label}</span>
            </Link>
        </DropdownMenuItem>
    )
}
