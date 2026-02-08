"use client"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { LogOut, Settings, User as UserIcon } from "lucide-react"

import { logout } from "@/app/actions/auth"
import { PreferencesModal } from "@/components/preferences-modal"
import { useState } from "react"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
    Avatar,
    AvatarFallback,
    AvatarImage,
} from "@/components/ui/avatar"

interface ProfileDropdownProps {
    userName: string
    userRole: string
    userEmail?: string
    userAvatarUrl?: string | null
}

export function ProfileDropdown({ userName, userRole, userEmail, userAvatarUrl }: ProfileDropdownProps) {
    const pathname = usePathname()
    // Robust navigation: Detect if we are in a path-based tenant (e.g. /school1/dashboard) or subdomain (/dashboard)
    // We assume the profile page is strictly at local "/dashboard/profile"
    const basePath = pathname?.split('/dashboard')[0] || ""
    const profileUrl = `${basePath}/dashboard/profile`

    const initials = userName
        .split(' ')
        .map((n) => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2)

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

    return (
        <>
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <div className="flex items-center gap-3 pl-4 border-l border-white/10 cursor-pointer group select-none">
                        <div className="text-right hidden md:block">
                            <div className="text-sm font-bold text-slate-200 leading-tight group-hover:text-white transition-colors max-w-[150px] truncate">{userName}</div>
                            <div className="text-[10px] text-blue-400 font-bold mt-0.5 uppercase tracking-widest">{userRole}</div>
                        </div>
                        <Avatar className="h-9 w-9 border border-white/10 shadow-inner group-hover:ring-2 group-hover:ring-blue-500/50 transition-all">
                            <AvatarImage src={userAvatarUrl || `https://api.dicebear.com/7.x/initials/svg?seed=${userName}`} className="object-cover" />
                            <AvatarFallback className="bg-gradient-to-br from-blue-500 to-indigo-600 text-white text-xs font-bold">
                                {initials}
                            </AvatarFallback>
                        </Avatar>
                    </div>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56 bg-slate-950/90 backdrop-blur-md border border-white/10 text-slate-200" align="end" forceMount>
                    <DropdownMenuLabel className="font-normal">
                        <div className="flex flex-col space-y-1">
                            <p className="text-sm font-medium leading-none text-white">{userName}</p>
                            <p className="text-xs leading-none text-slate-400">
                                {userEmail}
                            </p>
                        </div>
                    </DropdownMenuLabel>

                    <DropdownMenuItem asChild>
                        <Link href={profileUrl} className="flex items-center cursor-pointer hover:bg-white/5 focus:bg-white/5 focus:text-white w-full">
                            <UserIcon className="mr-2 h-4 w-4" />
                            <span>My Profile</span>
                        </Link>
                    </DropdownMenuItem>

                    <DropdownMenuItem
                        className="cursor-pointer hover:bg-white/5 focus:bg-white/5 focus:text-white mb-2"
                        onSelect={() => setPreferencesOpen(true)}
                    >
                        <Settings className="mr-2 h-4 w-4" />
                        <span>Preferences</span>
                    </DropdownMenuItem>

                    <DropdownMenuSeparator className="bg-white/10" />

                    <DropdownMenuItem
                        className="cursor-pointer text-slate-400 hover:text-red-400 hover:bg-red-500/10 focus:text-red-400 focus:bg-red-500/10 transition-colors mt-2"
                        onSelect={handleLogout}
                    >
                        <LogOut className="mr-2 h-4 w-4" />
                        <span>Log out</span>
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>

            <PreferencesModal open={preferencesOpen} onOpenChange={setPreferencesOpen} />
        </>
    )
}
