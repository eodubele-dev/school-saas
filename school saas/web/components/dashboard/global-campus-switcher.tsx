"use client"

import * as React from "react"
import { Check, ChevronsUpDown, Globe, Building2, Crown, PlusCircle } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
    CommandSeparator,
} from "@/components/ui/command"
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { type TenantOption } from "@/lib/actions/global"
import { useRouter } from "next/navigation"
import Link from "next/link"

type PopoverTriggerProps = React.ComponentPropsWithoutRef<typeof PopoverTrigger>

interface GlobalCampusSwitcherProps extends PopoverTriggerProps {
    tenants: TenantOption[]
    currentTenantSlug?: string
    sidebarOpen?: boolean
}

export function GlobalCampusSwitcher({
    className,
    tenants,
    currentTenantSlug,
    sidebarOpen = true
}: GlobalCampusSwitcherProps) {
    const [open, setOpen] = React.useState(false)
    const router = useRouter()

    // Find current tenant or default to "Global View" if pseudo-slug is used
    const selectedTenant = tenants.find(t => t.slug === currentTenantSlug)
    const isGlobalView = !selectedTenant || currentTenantSlug === 'global'

    const handleSelect = (slug: string) => {
        setOpen(false)
        if (slug === 'global') {
            // In a real app, this might redirect to a special global dashboard route
            // For now, let's assume it stays on current domain but changes context state
            // OR redirects to a main domain if configured.
            // Let's toggle a query param or just log for now, 
            // but the prompt implies a "switch".
            console.log("Switching to Global View")
            // Ideally: router.push(`https://admin.eduflow.ng/dashboard`)
            return
        }

        // Redirect to subdomain
        // Assuming development env: http://[slug].localhost:3000/dashboard
        const protocol = window.location.protocol
        const host = window.location.host
        const rootDomain = host.includes('localhost')
            ? 'localhost:3000'
            : 'eduflow.ng' // Production domain

        const newUrl = `${protocol}//${slug}.${rootDomain}/dashboard`
        window.location.href = newUrl
    }

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={open}
                    aria-label="Select a campus"
                    className={cn("w-full justify-between h-12 bg-white/5 border-white/10 hover:bg-white/10 hover:text-white text-slate-300", className)}
                >
                    <div className="flex items-center gap-2 truncate">
                        {isGlobalView ? (
                            <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-indigo-500/20 text-indigo-400">
                                <Globe className="w-5 h-5" />
                            </div>
                        ) : (
                            <Avatar className="w-8 h-8 rounded-lg border border-white/10">
                                <AvatarImage
                                    src={selectedTenant?.logoUrl}
                                    alt={selectedTenant?.name}
                                />
                                <AvatarFallback className="rounded-lg bg-emerald-500/20 text-emerald-400">
                                    {selectedTenant?.name.substring(0, 2).toUpperCase()}
                                </AvatarFallback>
                            </Avatar>
                        )}
                        <div className="flex flex-col items-start truncate text-left">
                            <span className="text-sm font-bold text-white truncate w-32">
                                {isGlobalView ? "Global Group View" : selectedTenant?.name}
                            </span>
                            <span className="text-[10px] text-slate-500 uppercase font-mono">
                                {isGlobalView ? "All Campuses" : "Active Campus"}
                            </span>
                        </div>
                    </div>
                    <ChevronsUpDown className="ml-auto h-4 w-4 shrink-0 opacity-50" />
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[250px] p-0 bg-slate-950 border-white/10">
                <Command className="bg-transparent text-slate-300">
                    <CommandList>
                        <CommandInput placeholder="Search campus..." className="h-9" />
                        <CommandEmpty>No campus found.</CommandEmpty>
                        <CommandGroup heading="Global Management">
                            <CommandItem
                                onSelect={() => handleSelect('global')}
                                className="text-sm data-[state=checked]:text-indigo-400 group cursor-pointer"
                            >
                                <Globe className="mr-2 h-4 w-4 text-indigo-500" />
                                <span className={isGlobalView ? "font-bold text-indigo-400" : ""}>Global Group View</span>
                                {isGlobalView && (
                                    <Check className="ml-auto h-4 w-4 text-indigo-500" />
                                )}
                            </CommandItem>
                        </CommandGroup>
                        <CommandSeparator className="bg-white/10" />
                        <CommandGroup heading="Campuses">
                            {tenants.map((tenant) => (
                                <CommandItem
                                    key={tenant.id}
                                    onSelect={() => handleSelect(tenant.slug)}
                                    className="text-sm cursor-pointer"
                                >
                                    <Avatar className="mr-2 h-5 w-5 rounded-full border border-white/10">
                                        <AvatarImage
                                            src={tenant.logoUrl}
                                            alt={tenant.name}
                                            className="grayscale transition-all group-hover:grayscale-0"
                                        />
                                        <AvatarFallback className="rounded-full bg-slate-800 text-[9px]">
                                            {tenant.name.substring(0, 2).toUpperCase()}
                                        </AvatarFallback>
                                    </Avatar>
                                    <span className={currentTenantSlug === tenant.slug ? "font-bold text-emerald-400" : ""}>{tenant.name}</span>
                                    {currentTenantSlug === tenant.slug && (
                                        <Check className="ml-auto h-4 w-4 text-emerald-500" />
                                    )}
                                </CommandItem>
                            ))}
                        </CommandGroup>
                        <CommandSeparator className="bg-white/10" />
                        <CommandGroup>
                            <div className="px-2 py-1.5">
                                <Link
                                    href="/dashboard/admin/campus/new"
                                    onClick={() => setOpen(false)}
                                    className="flex w-full items-center rounded-sm px-2 py-1.5 text-sm outline-none text-slate-500 hover:text-white hover:bg-white/10 cursor-pointer"
                                >
                                    <PlusCircle className="mr-2 h-4 w-4" />
                                    <span>Create New Campus</span>
                                </Link>
                            </div>
                        </CommandGroup>
                    </CommandList>
                </Command>
            </PopoverContent>
        </Popover>
    )
}
