"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { LogOut, User, Settings, Shield, CreditCard, BookOpen, GraduationCap, Users, Home } from "lucide-react"
import { logout } from "@/app/actions/auth"
import { useState, useEffect } from "react"
import { isDesktop } from "@/lib/utils/desktop"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useKiosk } from "@/components/providers/kiosk-provider"
import { Monitor } from "lucide-react"
import { PreferencesModal } from "@/components/preferences-modal"
import { UpgradeModal } from "@/components/modals/upgrade-modal"
import { toast } from "sonner"
import { Crown } from "lucide-react"

interface ProfileDropdownProps {
    userName: string
    userRole: string
    userEmail?: string
    userAvatarUrl?: string | null
    userId?: string // Added for Identity Command Card
    tier?: string
    tenantName?: string
    className?: string
    basePath?: string
}

export function ProfileDropdown({ userName, userRole, userEmail, userAvatarUrl, userId, tier = 'Free', tenantName = 'EduFlow', className, basePath = '' }: ProfileDropdownProps) {
    const router = useRouter()
    const { enableKiosk } = useKiosk()
    const [preferencesOpen, setPreferencesOpen] = useState(false)
    const [isUpgradeOpen, setIsUpgradeOpen] = useState(false)
    const [landingUrl, setLandingUrl] = useState("/")

    useEffect(() => {
        // Save basePath to localStorage for smart desktop bypassing
        if (basePath && typeof window !== 'undefined') {
            localStorage.setItem('eduflow-last-slug', basePath.replace('/', ''))
        }

        const host = window.location.host
        if (host.includes('localhost')) {
            const port = host.split(':')[1] || '3000'
            setLandingUrl(`http://localhost:${port}`)
        } else {
            const parts = host.split('.')
            if (parts.length >= 2) {
                const rootDomain = parts.slice(-2).join('.')
                setLandingUrl(`https://${rootDomain}`)
            }
        }
    }, [])

    const handleLogout = async () => {
        try {
            await logout()
        } catch (error) {
            console.error("Logout failed", error)
        } finally {
            // In Desktop app, we want to go back to the global discovery gate
            // In Web, we usually go to the school-specific login page
            if (isDesktop()) {
                router.push('/login')
            } else {
                router.push('/login')
            }
        }
    }

    const getRoleConfig = (role: string) => {
        const r = role.toUpperCase()
        switch (r) {
            case 'ADMIN':
            case 'OWNER':
            case 'PROPRIETOR':
            case 'SUPER-ADMIN':
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

    const [imageError, setImageError] = useState(false)
    const [headerImageError, setHeaderImageError] = useState(false)

    const isPremium = tier.toLowerCase() === 'platinum' || tier.toLowerCase() === 'pilot'
    const showUpgrade = !isPremium && ['ADMIN', 'OWNER', 'PROPRIETOR'].includes(userRole.toUpperCase())

    const config = getRoleConfig(userRole)
    const initials = userName.charAt(0).toUpperCase()

    return (
        <>
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <div className={`flex items-center gap-3 pl-4 border-l border-border cursor-pointer group select-none ${className}`}>
                        {/* Desktop View: Name & Role */}
                        <div className="text-right hidden md:block">
                            <div className="text-sm font-bold text-slate-200 leading-tight group-hover:text-foreground transition-colors max-w-[150px] truncate">
                                {userName}
                            </div>
                            <div className={`text-[9px] font-black mt-0.5 uppercase tracking-widest ${config.color}`}>
                                {config.label}
                            </div>
                        </div>

                        {/* Avatar */}
                        <div className={`h-9 w-9 rounded-full ${config.bg} ${config.border} border flex items-center justify-center text-sm font-bold shadow-inner group-hover:ring-2 ring-white/10 transition-all overflow-hidden`}>
                            {userAvatarUrl && !imageError ? (
                                <img
                                    src={userAvatarUrl}
                                    alt={userName}
                                    className="h-full w-full object-cover"
                                    onError={() => setImageError(true)}
                                />
                            ) : (
                                <span className={config.color}>{initials}</span>
                            )}
                        </div>
                    </div>
                </DropdownMenuTrigger>

                <DropdownMenuContent className="w-72 bg-[#0A0A0B] border border-border rounded-2xl shadow-2xl p-0 overflow-hidden" align="end" forceMount>
                    {/* 👤 Identity Header */}
                    <div className="p-5 border-b border-border/50 relative overflow-hidden">
                        {/* Background Glow */}
                        <div className={`absolute top-0 right-0 w-32 h-32 ${config.bg} blur-[50px] opacity-20 pointer-events-none rounded-full transform translate-x-10 -translate-y-10`} />

                        <div className="flex items-center gap-4 mb-3 relative z-10">
                            <div className={`w-12 h-12 rounded-full ${config.bg} ${config.border} border flex items-center justify-center font-bold text-lg shadow-lg`}>
                                {userAvatarUrl && !headerImageError ? (
                                    <img
                                        src={userAvatarUrl}
                                        alt={userName}
                                        className="h-full w-full object-cover rounded-full"
                                        onError={() => setHeaderImageError(true)}
                                    />
                                ) : (
                                    <span className={config.color}>{initials}</span>
                                )}
                            </div>
                            <div>
                                <p className="text-sm font-bold text-foreground leading-none">{userName}</p>
                                <p className="text-[10px] text-muted-foreground font-mono mt-1.5 flex items-center gap-1">
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
                        <DropdownLink href={`${basePath}/dashboard/profile`} icon={<User size={14} />} label="My Profile" />
                        
                        {userRole?.toUpperCase() === 'SYSTEM_OWNER' && (
                            <DropdownLink href="/super-admin" icon={<Shield size={14} />} label="Super-Admin Console" color="text-red-500" />
                        )}

                        {(userRole?.toUpperCase() === 'PROPRIETOR' || userRole?.toUpperCase() === 'ADMIN' || userRole?.toUpperCase() === 'OWNER') && (
                            <DropdownLink href={`${basePath}/dashboard/admin/security/audit`} icon={<Shield size={14} />} label="Security & Audit" color="text-amber-500" />
                        )}

                        {userRole === 'BURSAR' && (
                            <DropdownLink href={`${basePath}/dashboard/finance`} icon={<CreditCard size={14} />} label="Wallet & Ledger" color="text-cyan-400" />
                        )}

                        {(userRole === 'TEACHER' || userRole === 'STUDENT') && (
                            <DropdownLink href={`${basePath}/dashboard/academics`} icon={<BookOpen size={14} />} label="Curriculum Sync" />
                        )}

                        {userRole === 'PARENT' && (
                            <DropdownLink href={`${basePath}/dashboard/family`} icon={<Users size={14} />} label="Switch Child Account" color="text-emerald-400" />
                        )}

                        {/* Upgrade Button */}
                        {showUpgrade && (
                            <DropdownMenuItem
                                className="w-full flex items-center gap-3 px-4 py-2.5 rounded-lg hover:bg-secondary/50 transition-all cursor-pointer focus:bg-secondary/50 group"
                                onSelect={() => {
                                    toast.info("Institutional Expansion Protocols Active", {
                                        description: "Initializing Tier Selection Console...",
                                    })
                                    setIsUpgradeOpen(true)
                                }}
                            >
                                <Crown size={14} className="text-amber-500 group-hover:text-amber-400 transition-colors" />
                                <span className="text-xs font-bold text-amber-500 group-hover:text-amber-400 transition-colors uppercase tracking-wider">Upgrade Plan</span>
                            </DropdownMenuItem>
                        )}

                        <DropdownMenuItem
                            className="w-full flex items-center gap-3 px-4 py-2.5 rounded-lg hover:bg-secondary/50 transition-all cursor-pointer focus:bg-secondary/50"
                            onSelect={() => setPreferencesOpen(true)}
                        >
                            <Settings size={14} className="text-muted-foreground" />
                            <span className="text-xs font-medium text-slate-300">Preferences</span>
                        </DropdownMenuItem>

                        {(userRole?.toUpperCase() === 'PROPRIETOR' || userRole?.toUpperCase() === 'ADMIN' || userRole?.toUpperCase() === 'OWNER') && (
                            <DropdownMenuItem
                                className="w-full flex items-center gap-3 px-4 py-2.5 rounded-lg hover:bg-amber-500/10 transition-all cursor-pointer focus:bg-amber-500/10 group"
                                onSelect={() => {
                                    toast.warning("Kiosk Lockdown Initiated", {
                                        description: "System will now enter restricted workstation mode.",
                                    })
                                    enableKiosk()
                                }}
                            >
                                <Monitor size={14} className="text-amber-500 group-hover:scale-110 transition-transform" />
                                <span className="text-xs font-bold text-amber-500 tracking-tight">SECURE KIOSK MODE</span>
                            </DropdownMenuItem>
                        )}

                    </div>

                    {/* 🚪 Logout */}
                    <div className="p-2 border-t border-border/50">
                        <button
                            onClick={handleLogout}
                            className="w-full flex items-center gap-3 px-4 py-2.5 text-red-500 hover:bg-red-500/10 rounded-lg transition-all group"
                        >
                            <LogOut size={14} className="group-hover:translate-x-0.5 transition-transform" />
                            <span className="text-xs font-bold uppercase tracking-widest">Sign Out</span>
                        </button>
                    </div>
                </DropdownMenuContent>
            </DropdownMenu>

            <PreferencesModal open={preferencesOpen} onOpenChange={setPreferencesOpen} />
            <UpgradeModal
                isOpen={isUpgradeOpen}
                onClose={() => setIsUpgradeOpen(false)}
                currentTier={tier}
                tenantName={tenantName}
            />
        </>
    )
}

interface DropdownLinkProps {
    href: string
    icon: React.ReactNode
    label: string
    color?: string
}

function DropdownLink({ href, icon, label, color = "text-muted-foreground" }: DropdownLinkProps) {
    return (
        <DropdownMenuItem asChild>
            <Link href={href} className="w-full flex items-center gap-3 px-4 py-2.5 rounded-lg hover:bg-secondary/50 transition-all text-left cursor-pointer focus:bg-secondary/50">
                <span className={color}>{icon}</span>
                <span className="text-xs font-medium text-slate-300">{label}</span>
            </Link>
        </DropdownMenuItem>
    )
}
