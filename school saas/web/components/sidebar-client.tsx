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
    HelpCircle,
    AlertCircle
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

export function SidebarClient({
    role: initialRole = 'student',
    userName = 'Guest User',
    brandColor = '#3b82f6' // Default Blue
}: {
    role?: string,
    userName?: string,
    brandColor?: string
}) {
    const pathname = usePathname()
    const router = useRouter()

    // Normalize role string (handle potential spaces or case)
    const normalizedRole = (initialRole || 'student').trim().toLowerCase()

    // Validate role against config keys
    const roleKey = Object.keys(SIDEBAR_LINKS).includes(normalizedRole)
        ? normalizedRole as UserRole
        : 'student'

    const role = roleKey

    // Cast to grouping type safely
    const categories = SIDEBAR_LINKS[role] as SidebarCategory[]

    // Debug Log
    useEffect(() => {
        console.log('[SidebarClient] Initialized', {
            propRole: initialRole,
            resolvedRole: role,
            categoriesCount: categories?.length
        })
    }, [initialRole, role, categories])

    // State for Search
    const [openSearch, setOpenSearch] = useState(false)
    const [searchQuery, setSearchQuery] = useState("")

    // State for Collapsed Categories
    // Initialize Logic: Default to FIRST category open to ensure content is visible immediately.
    const [openCategories, setOpenCategories] = useState<Record<string, boolean>>(() => {
        if (!categories || categories.length === 0) return {}
        // Always default open the first category to ensure visibility
        return { [categories[0].category]: true }
    })

    // Effect: Sync logic for client-side navigation updates (only subsequent navs)
    useEffect(() => {
        if (!categories || categories.length === 0) return

        if (pathname === '/dashboard' || pathname === '/dashboard/') {
            // Ensure first category is open if we navigate back to root
            setOpenCategories(prev => {
                if (categories[0] && !prev[categories[0].category]) {
                    return { [categories[0].category]: true }
                }
                return prev // Don't update if already correct
            })
            return
        }

        // Find active category
        const activeCategory = categories.find(cat =>
            cat.items?.some(item =>
                item.href === '/dashboard' ? pathname === item.href : pathname.startsWith(item.href)
            )
        )

        // Only update if not already open (prevent redundant renders)
        if (activeCategory) {
            setOpenCategories(prev => {
                if (!prev[activeCategory.category]) {
                    return { [activeCategory.category]: true }
                }
                return prev // Don't update if already correct
            })
        }
    }, [pathname, categories]) // Removed openCategories from deps - using functional setState instead

    // Toggle Category
    const toggleCategory = (catName: string) => {
        setOpenCategories(prev => {
            const isOpen = prev[catName]
            return isOpen ? {} : { [catName]: true }
        })
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

    if (!categories || categories.length === 0) {
        return (
            <div className="flex flex-col h-full bg-slate-950 border-r border-white/5 p-4 text-slate-500 text-sm">
                <AlertCircle className="mb-2 h-6 w-6 text-red-500" />
                No navigation items found for role: {role}
            </div>
        )
    }

    return (
        <div className="flex flex-col h-full bg-slate-950 border-r border-white/5 relative group/sidebar">
            {/* 1. Global Search Trigger */}
            <div className="px-4 py-4">
                <button
                    onClick={() => setOpenSearch(true)}
                    className="w-full flex items-center gap-2 px-3 py-2 rounded-lg bg-slate-900 border border-white/20 text-slate-100 text-xs hover:border-white/40 transition-colors group/search shadow-lg"
                    style={{ borderColor: openSearch ? brandColor : undefined }}
                >
                    <Search className="h-3 w-3 group-hover/search:text-white text-slate-300" />
                    <span className="flex-1 text-left font-medium">Quick Find...</span>
                    <span className="flex items-center gap-0.5 px-1.5 py-0.5 rounded bg-slate-800 text-[10px] font-mono border border-white/10 text-slate-300">
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
                            {cat.items?.map((item) => (
                                <CommandItem
                                    key={item.href}
                                    value={`${cat.category} ${item.label}`}
                                    onSelect={() => handleSearchSelect(item.href)}
                                >
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
                    if (isSystem) return null

                    // Guard against missing items
                    if (!cat.items) return null

                    const isOpen = openCategories[cat.category]

                    return (
                        <div key={cat.category} className="space-y-1">
                            {/* Category Header (Accordion Trigger) */}
                            <button
                                onClick={() => toggleCategory(cat.category)}
                                className={cn(
                                    "w-full flex items-center justify-between text-[11px] uppercase tracking-wider font-bold py-3 px-2 rounded-md transition-all duration-200 group/cat border border-transparent",
                                    isOpen
                                        ? "text-white bg-white/10 border-white/10 shadow-sm"
                                        : "text-white hover:text-white hover:bg-white/10"
                                )}
                            >
                                <div className="flex items-center gap-2">
                                    {cat.icon && <cat.icon className={cn("h-4 w-4 text-white")} style={isOpen ? { color: brandColor } : undefined} />}
                                    {cat.category}
                                </div>
                                <ChevronRight className={cn("h-3 w-3 transition-transform duration-200 text-white", isOpen && "rotate-90")} />
                            </button>

                            {/* Links (Collapsible) */}
                            <div className={cn(
                                "space-y-1 transition-all duration-300 ease-in-out pl-2 border-l border-white/5 ml-4 overflow-hidden",
                                isOpen ? "max-h-[2000px] opacity-100 mt-1" : "max-h-0 opacity-0"
                            )}>
                                {cat.items.map((item) => {
                                    const IconComponent = item.icon
                                    const isActive = item.href === '/dashboard'
                                        ? pathname === item.href
                                        : pathname.startsWith(item.href)


                                    if (item.disabled) {
                                        return (
                                            <div key={item.label} className="flex items-center gap-3 px-3 py-2 text-sm text-slate-400 cursor-not-allowed">
                                                <IconComponent className="h-4 w-4 opacity-70" />
                                                <span className="opacity-70">{item.label}</span>
                                                {item.badge && <span className="ml-auto text-[9px] border border-slate-600 px-1 rounded text-slate-400">{item.badge}</span>}
                                            </div>
                                        )
                                    }

                                    return (
                                        <Link
                                            key={item.href}
                                            href={item.href}
                                            className={cn(
                                                "flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-all duration-200 group/link relative font-medium",
                                                isActive
                                                    ? "bg-white/10 shadow-sm"
                                                    : "text-slate-100 hover:text-white hover:bg-white/5"
                                            )}
                                            style={isActive ? {
                                                color: brandColor,
                                                backgroundColor: `${brandColor}15`, // ~8% opacity
                                                borderColor: `${brandColor}20`
                                            } : undefined}
                                        >
                                            <IconComponent
                                                className={cn(
                                                    "h-4 w-4 transition-colors",
                                                    !isActive && "text-slate-400 group-hover/link:text-white"
                                                )}
                                                style={{ color: isActive ? brandColor : undefined }}
                                            />
                                            <span>{item.label}</span>

                                            {/* Active Dot instead of Bar for cleaner look in subsection */}
                                            {isActive && (
                                                <div className="ml-auto h-1.5 w-1.5 rounded-full shadow-[0_0_8px_currentColor]" style={{ backgroundColor: brandColor }} />
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
                {categories.find(c => c.category === "System")?.items?.map(item => {
                    const IconComponent = item.icon
                    const isActive = pathname.startsWith(item.href)
                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={cn(
                                "flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-all duration-200 group/link relative font-medium",
                                isActive ? "text-white bg-white/10" : "text-slate-100 hover:text-white hover:bg-white/5"
                            )}
                        >
                            <IconComponent className={cn("h-4 w-4", !isActive && "text-slate-400")} style={isActive ? { color: brandColor } : undefined} />
                            <span>{item.label}</span>
                        </Link>
                    )
                })}
                <button className="w-full flex items-center gap-3 px-3 py-2 rounded-md text-sm text-slate-100 hover:text-white transition-all hover:bg-white/5 text-left font-medium">
                    <HelpCircle className="h-4 w-4 text-slate-400" />
                    <span>Help & Support</span>
                </button>
            </div>
        </div>
    )
}
