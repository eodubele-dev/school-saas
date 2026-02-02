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

    return (
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
            <DropdownMenuContent className="w-56" align="end" forceMount>
                <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                        <p className="text-sm font-medium leading-none">{userName}</p>
                        <p className="text-xs leading-none text-muted-foreground">
                            {userEmail}
                        </p>
                    </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="cursor-pointer">
                    <UserIcon className="mr-2 h-4 w-4" />
                    <span>Profile</span>
                </DropdownMenuItem>
                <DropdownMenuItem className="cursor-pointer">
                    <Settings className="mr-2 h-4 w-4" />
                    <span>Settings</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                    className="cursor-pointer text-red-600 focus:text-red-600 focus:bg-red-50"
                    onClick={() => logout()}
                >
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Log out</span>
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    )
}
