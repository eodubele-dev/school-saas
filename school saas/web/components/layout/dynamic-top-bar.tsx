"use client"

import React from 'react'
import {
    Bell,
    Search,
    Settings,
    HelpCircle,
    MapPin,
    Plus,
    Activity,
    Users,
    CreditCard,
    LayoutGrid,
    GraduationCap,
    BookOpen,
    Menu
} from 'lucide-react'
import { Button } from "@/components/ui/button"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { ProfileDropdown } from "@/components/profile-dropdown"
import { MobileNav } from "@/components/mobile-nav"

import { SystemPulse } from "@/components/layout/top-bar/system-pulse"
import { AttendancePip } from "@/components/layout/top-bar/attendance-pip"
import { SMSWalletMonitor } from "@/components/layout/top-bar/sms-wallet"
import { ReconciliationAction } from "@/components/layout/top-bar/reconciliation-action"

interface DynamicTopBarProps {
    user: any
    role: string
    schoolName?: string
    mobileNav: React.ReactNode
    userProfile?: any
    campuses?: any[]
    teacherClasses?: any[]
    pendingReconciliations?: number
    className?: string
}

export function DynamicTopBar({
    user,
    role,
    schoolName = "EduFlow",
    mobileNav,
    userProfile,
    campuses = [],
    teacherClasses = [],
    pendingReconciliations = 0
}: DynamicTopBarProps) {
    const normalizedRole = role.toUpperCase()

    const renderRoleUtilities = () => {
        switch (normalizedRole) {
            case 'ADMIN':
            case 'OWNER':
            case 'PROPRIETOR':
                return (
                    <>
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <button className="flex items-center gap-2 bg-amber-500/10 text-amber-500 px-3 py-1.5 rounded-lg border border-amber-500/20 text-[10px] font-mono font-black hover:bg-amber-500/20 transition-colors">
                                    <MapPin size={14} />
                                    <span className="hidden sm:inline">
                                        {campuses.length > 0 ? campuses[0].name.toUpperCase() : 'MAIN_CAMPUS'}
                                    </span>
                                </button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent className="w-56 bg-slate-950 border-slate-800 text-slate-200">
                                <DropdownMenuLabel>Switch Campus</DropdownMenuLabel>
                                <DropdownMenuSeparator className="bg-slate-800" />
                                {campuses.length > 0 ? (
                                    campuses.map((campus: any) => (
                                        <DropdownMenuItem key={campus.id} className="focus:bg-slate-900 focus:text-amber-500">
                                            <MapPin className="mr-2 h-4 w-4" /> {campus.name}
                                        </DropdownMenuItem>
                                    ))
                                ) : (
                                    <DropdownMenuItem disabled>No Campuses Found</DropdownMenuItem>
                                )}
                            </DropdownMenuContent>
                        </DropdownMenu>

                        <SystemPulse />

                        <Button variant="ghost" size="icon" className="text-slate-400 hover:text-white hidden sm:flex">
                            <Settings size={20} />
                        </Button>
                    </>
                )
            case 'BURSAR':
                return (
                    <>
                        {/* Campus Filter (Simplified for Bursar) */}
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <button className="hidden md:flex items-center gap-2 bg-slate-800/50 text-slate-300 px-3 py-1.5 rounded-lg border border-slate-700 text-[10px] font-bold hover:bg-slate-800 transition-colors">
                                    <MapPin size={14} />
                                    <span>{campuses.length > 0 ? campuses[0].name.toUpperCase() : 'MAIN'}</span>
                                </button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent className="w-48 bg-slate-950 border-slate-800">
                                {campuses.length > 0 ? (
                                    campuses.map((campus: any) => (
                                        <DropdownMenuItem key={campus.id}>{campus.name}</DropdownMenuItem>
                                    ))
                                ) : (
                                    <DropdownMenuItem disabled>No Campuses</DropdownMenuItem>
                                )}
                            </DropdownMenuContent>
                        </DropdownMenu>

                        <SMSWalletMonitor />

                        <ReconciliationAction pendingCount={pendingReconciliations} />

                        <div className="w-px h-6 bg-white/10 mx-2 hidden sm:block" />
                    </>
                )
            case 'TEACHER':
                // Determine active class (first one or default)
                const activeClass = teacherClasses.length > 0 ? teacherClasses[0] : null

                return (
                    <>
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <button className="flex items-center gap-2 bg-purple-500/10 text-purple-500 px-3 py-1.5 rounded-lg border border-purple-500/20 text-[10px] font-black hover:bg-purple-500/20 transition-colors">
                                    <Users size={14} />
                                    <span className="hidden sm:inline">
                                        {activeClass ? `${activeClass.name} (Active)` : 'NO CLASSES'}
                                    </span>
                                </button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent className="w-56 bg-slate-950 border-slate-800 text-slate-200">
                                <DropdownMenuLabel>Select Classroom</DropdownMenuLabel>
                                <DropdownMenuSeparator className="bg-slate-800" />
                                {teacherClasses.length > 0 ? (
                                    teacherClasses.map((ac: any) => (
                                        <DropdownMenuItem key={ac.id}>
                                            {ac.name} <span className="text-slate-500 ml-1 text-xs">({ac.subject})</span>
                                        </DropdownMenuItem>
                                    ))
                                ) : (
                                    <DropdownMenuItem disabled>No classes assigned</DropdownMenuItem>
                                )}
                            </DropdownMenuContent>
                        </DropdownMenu>

                        {/* Pass active class ID if available, else null to disable */}
                        <AttendancePip classId={activeClass?.id} />

                        <Button size="sm" className="hidden sm:flex bg-cyan-600 hover:bg-cyan-500 text-black text-[10px] font-black uppercase items-center gap-2 h-8">
                            <Plus size={14} /> Assess
                        </Button>
                    </>
                )
            case 'PARENT':
                return (
                    <>
                        <button className="flex items-center gap-2 bg-emerald-500/10 text-emerald-500 px-3 py-1.5 rounded-lg border border-emerald-500/20 text-[10px] font-bold">
                            <Users size={14} />
                            <span className="hidden sm:inline">FAMILY_ID: {user.id.slice(0, 6).toUpperCase()}</span>
                        </button>
                        <Button size="sm" variant="outline" className="hidden sm:flex border-slate-800 text-slate-400 hover:text-white text-[10px] uppercase h-8">
                            <CreditCard size={14} className="mr-2" /> Pay Fees
                        </Button>
                    </>
                )
            case 'STUDENT':
                return (
                    <>
                        <div className="flex items-center gap-2 bg-indigo-500/10 text-indigo-400 px-3 py-1.5 rounded-lg border border-indigo-500/20 text-[10px] font-bold">
                            <GraduationCap size={14} />
                            <span className="hidden sm:inline">STUDENT PORTAL</span>
                        </div>
                        <Button size="sm" variant="ghost" className="hidden sm:flex text-slate-400 hover:text-white text-[10px] uppercase h-8">
                            <BookOpen size={14} className="mr-2" /> Portfolio
                        </Button>
                    </>
                )
            default:
                return null
        }
    }

    const getSearchPlaceholder = () => {
        switch (normalizedRole) {
            case 'ADMIN': return 'Search students, staff, or finance...'
            case 'TEACHER': return 'Search student or lesson plan...'
            case 'PARENT': return 'Search results or invoices...'
            case 'STUDENT': return 'Search assignments or resources...'
            default: return 'Search...'
        }
    }

    return (
        <header className="sticky top-0 z-50 w-full border-b border-white/5 bg-[#0A0A0B]/80 backdrop-blur-md">
            <div className="flex h-16 items-center px-4 md:px-8 gap-4 justify-between">

                {/* ZONE 1: BRANDING & MOBILE TRIGGER */}
                <div className="flex items-center gap-4">
                    <div className="lg:hidden">
                        {mobileNav}
                    </div>
                    {/* Brand Logo - Visible on all screens, but maybe hidden on super small if search is active */}
                    <div className="hidden md:flex items-center gap-2">
                        <div className="h-8 w-8 rounded-lg bg-indigo-600 flex items-center justify-center shadow-[0_0_15px_rgba(79,70,229,0.5)]">
                            <span className="text-white font-black text-sm">Ed</span>
                        </div>
                        {/* <span className="font-bold text-white tracking-tight hidden lg:block">{schoolName}</span> */}
                    </div>
                </div>

                {/* ZONE 2: SCOPED SEARCH (FLEX GROW) */}
                <div className="flex-1 max-w-2xl px-2 md:px-8">
                    <div className="relative group">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-[var(--school-accent)] transition-colors" size={16} />
                        <input
                            type="text"
                            placeholder={getSearchPlaceholder()}
                            className="w-full bg-slate-900/50 border border-white/10 rounded-xl py-2 pl-10 pr-4 text-xs text-slate-200 focus:bg-slate-900 focus:border-indigo-500/50 outline-none transition-all placeholder:text-slate-600"
                        />
                        <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1">
                            <kbd className="hidden sm:inline-flex h-5 select-none items-center gap-1 rounded border border-slate-800 bg-slate-950 px-1.5 font-mono text-[10px] font-medium text-slate-500 opacity-100">
                                <span className="text-xs">⌘</span>K
                            </kbd>
                        </div>
                    </div>
                </div>

                {/* ZONE 3: DYNAMIC UTILITIES & PROFILE */}
                <div className="flex items-center gap-3 md:gap-4">

                    {/* Role Specific Actions */}
                    {renderRoleUtilities()}

                    {/* Divider */}
                    <div className="h-6 w-px bg-white/10 hidden sm:block" />

                    {/* Notifications */}
                    <button className="relative text-slate-400 hover:text-white transition-colors p-2 rounded-full hover:bg-white/5">
                        <Bell size={20} />
                        <span className="absolute top-2 right-2 h-2 w-2 rounded-full bg-red-500 border border-[#0A0A0B]" />
                    </button>

                    {/* Help */}
                    <button className="text-slate-400 hover:text-white transition-colors p-2 rounded-full hover:bg-white/5 hidden sm:block">
                        <HelpCircle size={20} />
                    </button>

                    {/* Profile */}
                    {userProfile && (
                        <ProfileDropdown
                            userName={userProfile.userName}
                            userRole={userProfile.userRole}
                            userEmail={userProfile.userEmail}
                            userAvatarUrl={userProfile.userAvatarUrl}
                            userId={user?.id}
                            className="ml-2"
                        />
                    )}
                </div>
            </div>
        </header>
    )
}
