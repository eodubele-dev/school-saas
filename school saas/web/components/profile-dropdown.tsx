'use client'

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
import { LogOut, Settings, User as UserIcon } from "lucide-react"
import { logout } from "@/app/actions/auth"
import { PreferencesModal } from "@/components/preferences-modal"
import { useState } from "react"

interface ProfileDropdownProps {
    userName: string
    userRole: string
    userEmail?: string
}

export function ProfileDropdown({ userName, userRole, userEmail }: ProfileDropdownProps) {
    const initials = userName
        .split(' ')
        .map((n) => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2)

    const [preferencesOpen, setPreferencesOpen] = useState(false)

    return (
        <>
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <div className="flex items-center gap-3 pl-4 border-l border-white/10 cursor-pointer group select-none">
                        <div className="text-right hidden sm:block">
                            <div className="text-sm font-medium text-slate-200 leading-none group-hover:text-white transition-colors">{userName}</div>
                            <div className="text-[10px] text-blue-400 font-semibold mt-1 uppercase tracking-wider">{userRole}</div>
                        </div>
                        <Avatar className="h-9 w-9 border border-white/10 shadow-inner group-hover:ring-2 group-hover:ring-blue-500/50 transition-all">
                            <AvatarImage src={`https://api.dicebear.com/7.x/initials/svg?seed=${userName}`} />
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
                    <DropdownMenuSeparator className="bg-white/10" />

                    <DropdownMenuItem className="cursor-pointer hover:bg-white/5 focus:bg-white/5 focus:text-white">
                        <UserIcon className="mr-2 h-4 w-4" />
                        <span>My Profile</span>
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
                        onClick={() => logout()}
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
