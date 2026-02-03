"use client"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { cn } from "@/lib/utils"
import { useState, useEffect, useMemo } from "react"
import {
    ChevronDown,
    ChevronRight,
    Search,
    Command,
    Settings,
    HelpCircle
} from "lucide-react"
import {
    CommandDialog,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
} from "@/components/ui/command"

import { SIDEBAR_LINKS, type UserRole, type SidebarCategory, type SidebarItem } from "@/config/sidebar"

export function SidebarClient({ role: initialRole = 'student', userName = 'Guest User' }: { role?: string, userName?: string }) {
    const pathname = usePathname()
    const router = useRouter()
    const role = (Object.keys(SIDEBAR_LINKS).includes(initialRole) ? initialRole : 'student') as UserRole

    // Cast to grouping type safely
    const categories = SIDEBAR_LINKS[role] as SidebarCategory[]

    // State for Search
    const [openSearch, setOpenSearch] = useState(false)
    const [searchQuery, setSearchQuery] = useState("")

    // State for Collapsed Categories
    // Logic: Key = category name. Value = true (open) or false (closed).
    const [openCategories, setOpenCategories] = useState<Record<string, boolean>>({})

    // Effect: "Active Context" Auto-Collapse
    // When path changes, find which category contains the active link and open it.
    useEffect(() => {
        const activeCategory = categories.find(cat =>
            cat.items.some(item =>
                item.href === '/dashboard' ? pathname === item.href : pathname.startsWith(item.href)
            )
        )

        if (activeCategory) {
            // Set only this category to open (Auto-collapse others logic)
            // Or we could keep others open if we want "sticky" state. 
            // The prompt asks for "Campus Logistics and Core Operations should automatically collapse"
            // So we reset state to only the active one.
            setOpenCategories({ [activeCategory.category]: true })
        }
    }, [pathname, categories])

    // Toggle Category
    const toggleCategory = (catName: string) => {
        setOpenCategories(prev => ({
            ...prev,
            [catName]: !prev[catName]
        }))
    }

    // Keyboard shortcut for search
    useEffect(() => {
        const down = (e: KeyboardEvent) => {
            if ((e.key === "k" && (e.metaKey || e.ctrlKey)) || e.key === "/") {
                if (
                    (e.target instanceof HTMLElement && e.target.isContentEditable) ||
                    e.target instanceof HTMLInputElement ||
                    e.target instanceof HTMLTextAreaElement ||
                    e.target instanceof HTMLSelectElement
                ) {
                    return
                }

                e.preventDefault()
                setOpenSearch((open) => !open)
            }
        }

        document.addEventListener("keydown", down)
        return () => document.removeEventListener("keydown", down)
    }, [])

    const handleSearchSelect = (href: string) => {
        router.push(href)
        setOpenSearch(false)
    }

    return (
        <div className="flex flex-col h-full bg-slate-950 border-r border-white/5 relative group/sidebar">
            {/* 1. Global Search Trigger */}
            <div className="px-4 py-4">
                <button
                    onClick={() => setOpenSearch(true)}
                    className="w-full flex items-center gap-2 px-3 py-2 rounded-lg bg-slate-900 border border-white/10 text-slate-400 text-xs hover:border-[var(--school-accent)]/50 transition-colors group/search"
                >
                    <Search className="h-3 w-3 group-hover/search:text-white" />
                    <span className="flex-1 text-left">Quick Find...</span>
                    <span className="flex items-center gap-0.5 px-1.5 py-0.5 rounded bg-slate-800 text-[10px] font-mono border border-white/5">
                        <span className="text-xs">⌘</span>K
                    </span>
                </button>
            </div>

            {/* Command Palette Dialog */}
            <CommandDialog open={openSearch} onOpenChange={setOpenSearch}>
                <CommandInput placeholder="Search modules (e.g. Bus, Fees, Staff)..." />
                <CommandList>
                    <CommandEmpty>No results found.</CommandEmpty>
                    {categories.map((cat) => (
                        <CommandGroup key={cat.category} heading={cat.category}>
                            {cat.items.map((item) => (
                                <CommandItem key={item.href} onSelect={() => handleSearchSelect(item.href)}>
                                    <item.icon className="mr-2 h-4 w-4" />
                                    <span>{item.label}</span>
                                </CommandItem>
                            ))}
                        </CommandGroup>
                    ))}
                </CommandList>
            </CommandDialog>

            {/* 2. Scrollable Navigation Area */}
            <div className="flex-1 overflow-y-auto px-4 pb-4 space-y-6 scrollbar-thin scrollbar-thumb-slate-800">
                {categories.map((cat, index) => {
                    const isSystem = cat.category === "System"

                    // If it's the System category (Settings), render it at the bottom differently if desired
                    // But prompt asked for strict pinning. We'll handle visual separation here.

                    if (isSystem) return null // Skip, we'll render system at the bottom manually

                    return (
                        <div key={cat.category} className="space-y-1">
                            {/* Category Header (Accordion Trigger) */}
                            <button
                                onClick={() => toggleCategory(cat.category)}
                                className="w-full flex items-center justify-between text-[11px] uppercase tracking-wider font-bold text-slate-500 hover:text-slate-300 py-2 group/cat transition-colors"
                            >
                                {cat.category}
                                <ChevronRight className={`h-3 w-3 text-slate-600 transition-transform duration-200 ${openCategories[cat.category] ? 'rotate-90' : ''}`} />
                            </button>

                            {/* Links (Collapsible) */}
                            <div className={cn(
                                "space-y-1 overflow-hidden transition-all duration-300 ease-in-out",
                                openCategories[cat.category] ? "max-h-[500px] opacity-100" : "max-h-0 opacity-50"
                            )}>
                                {cat.items.map((item) => {
                                    const IconComponent = item.icon
                                    const isActive = item.href === '/dashboard'
                                        ? pathname === item.href
                                        : pathname.startsWith(item.href)

                                    if (item.disabled) {
                                        return (
                                            <div key={item.label} className="flex items-center gap-3 px-3 py-2 text-sm text-slate-600 cursor-not-allowed">
                                                <IconComponent className="h-4 w-4 opacity-50" />
                                                <span className="opacity-50">{item.label}</span>
                                                {item.badge && <span className="ml-auto text-[9px] border border-slate-700 px-1 rounded text-slate-500">{item.badge}</span>}
                                            </div>
                                        )
                                    }

                                    return (
                                        <Link
                                            key={item.href}
                                            href={item.href}
                                            className={cn(
                                                "flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-all duration-200 group/link relative",
                                                isActive
                                                    ? "text-white font-bold bg-white/5"
                                                    : "text-slate-400 hover:text-white hover:bg-white/5"
                                            )}
                                        >
                                            <IconComponent className={cn(
                                                "h-4 w-4 transition-colors",
                                                isActive ? "text-[var(--school-accent)]" : "text-slate-500 group-hover/link:text-slate-300"
                                            )} />
                                            <span>{item.label}</span>

                                            {/* Active Glow Bar */}
                                            {isActive && (
                                                <div className="absolute left-0 top-0 bottom-0 w-[3px] bg-[var(--school-accent)] rounded-l-full shadow-[0_0_10px_var(--school-accent)] opactiy-80" />
                                            )}
                                        </Link>
                                    )
                                })}
                            </div>
                        </div>
                    )
                })}
            </div>

            {/* 3. Footer / anchored System Links */}
            <div className="mt-auto border-t border-white/5 p-4 space-y-1 bg-slate-950 z-10">
                {categories.find(c => c.category === "System")?.items.map(item => {
                    const IconComponent = item.icon
                    const isActive = pathname.startsWith(item.href)
                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={cn(
                                "flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-all duration-200 group/link relative",
                                isActive ? "text-white font-bold" : "text-slate-400 hover:text-white"
                            )}
                        >
                            <IconComponent className={cn("h-4 w-4", isActive ? "text-[var(--school-accent)]" : "text-slate-500")} />
                            <span>{item.label}</span>
                        </Link>
                    )
                })}
                <button className="w-full flex items-center gap-3 px-3 py-2 rounded-md text-sm text-slate-400 hover:text-white transition-all">
                    <HelpCircle className="h-4 w-4 text-slate-500" />
                    <span>Help & Support</span>
                </button>
            </div>
        </div>
    )
}
