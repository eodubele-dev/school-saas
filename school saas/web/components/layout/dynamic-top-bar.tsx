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
import Link from 'next/link'
import { toast } from 'sonner'
import { OmniSearch } from "@/components/omni-search"
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
    schoolLogo?: string | null
    mobileNav: React.ReactNode
    userProfile?: any
    campuses?: any[]
    teacherClasses?: any[]
    pendingReconciliations?: number
    activeSession?: string
    className?: string
}

export function DynamicTopBar({
    user,
    role,
    schoolName = "EduFlow",
    schoolLogo,
    mobileNav,
    userProfile,
    campuses = [],
    teacherClasses = [],
    pendingReconciliations = 0,
    activeSession
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
                                <button className="flex items-center gap-2 bg-amber-500/10 text-amber-500 px-3 py-1.5 rounded-lg border border-amber-500/20 text-[10px] font-mono font-black hover:bg-amber-500/20 transition-colors outline-none">
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

                        <SMSWalletMonitor />

                        {/* Settings Hidden as requested */}
                        {/* <Link href="/dashboard/settings">
                            <Button variant="ghost" size="icon" className="text-slate-400 hover:text-white hidden sm:flex">
                                <Settings size={20} />
                            </Button>
                        </Link> */}
                    </>
                )
            case 'BURSAR':
                return (
                    <>
                        {/* Campus Filter (Simplified for Bursar) */}
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <button className="hidden md:flex items-center gap-2 bg-slate-800/50 text-slate-300 px-3 py-1.5 rounded-lg border border-slate-700 text-[10px] font-bold hover:bg-slate-800 transition-colors outline-none">
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
                                <button className="flex items-center gap-2 bg-purple-500/10 text-purple-500 px-3 py-1.5 rounded-lg border border-purple-500/20 text-[10px] font-black hover:bg-purple-500/20 transition-colors outline-none">
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

    return (
        <header className="sticky top-0 z-50 w-full border-b border-white/5 bg-[#0A0A0B]/80 backdrop-blur-md">
            <div className="flex h-16 items-center px-4 md:px-8 gap-4 justify-between">

                {/* ZONE 1: BRANDING & MOBILE TRIGGER */}
                <div className="flex items-center gap-4">
                    <div className="lg:hidden">
                        {mobileNav}
                    </div>
                </div>

                {/* ZONE 2: SCOPED SEARCH (FLEX GROW) */}
                <div className="flex-1 max-w-2xl px-2 md:px-8 flex items-center gap-4">
                    <OmniSearch />
                    {activeSession && (
                        <div className="hidden lg:flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-xs font-medium text-slate-300 whitespace-nowrap">
                            <Activity className="h-3 w-3 text-[var(--school-accent)]" />
                            {activeSession}
                        </div>
                    )}
                </div>

                {/* ZONE 3: DYNAMIC UTILITIES & PROFILE */}
                <div className="flex items-center gap-3 md:gap-4">

                    {/* Role Specific Actions */}
                    {renderRoleUtilities()}

                    {/* Divider */}
                    <div className="h-6 w-px bg-white/10 hidden sm:block" />

                    {/* Notifications */}
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <button className="relative text-slate-400 hover:text-white transition-colors p-2 rounded-full hover:bg-white/5 outline-none">
                                <Bell size={20} />
                                <span className="absolute top-2 right-2 h-2 w-2 rounded-full bg-red-500 border border-[#0A0A0B]" />
                            </button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-80 bg-[#0A0A0B] border-slate-800 text-slate-200">
                            <DropdownMenuLabel>
                                Notifications
                                <span className="ml-2 text-xs text-slate-500 font-normal">(0 New)</span>
                            </DropdownMenuLabel>
                            <DropdownMenuSeparator className="bg-slate-800" />
                            <div className="p-8 text-center text-sm text-slate-500 flex flex-col items-center gap-2">
                                <Bell className="h-8 w-8 opacity-20" />
                                <p>You're all caught up!</p>
                            </div>
                        </DropdownMenuContent>
                    </DropdownMenu>

                    {/* Help */}
                    <button
                        onClick={() => toast.info("Help Center coming soon!")}
                        className="text-slate-400 hover:text-white transition-colors p-2 rounded-full hover:bg-white/5 hidden sm:block outline-none"
                    >
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
