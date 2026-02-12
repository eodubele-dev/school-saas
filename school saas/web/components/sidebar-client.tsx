"use client"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { cn } from "@/lib/utils"
import { useState, useEffect } from "react"
import {
    ChevronDown,
    Search,
    Settings,
    HelpCircle,
    AlertCircle,
    ShieldCheck,
    Mail
} from "lucide-react"
import { toast } from "sonner"
import {
    CommandDialog,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
} from "@/components/ui/command"
import { SupportModal } from "@/components/modals/support-modal"
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip"
import { Crown } from "lucide-react"

import { SIDEBAR_LINKS, type UserRole, type SidebarCategory, type SidebarItem } from "@/config/sidebar"
import { StudentSwitcher } from "./dashboard/student-switcher"
import { UpgradeModal } from "@/components/modals/upgrade-modal"

export function SidebarClient({
    role: initialRole = 'student',
    userName = 'Guest User',
    brandColor = '#3b82f6',
    tenantName = 'EduFlow',
    tenantMotto = 'Excellence in Education',
    tier = 'starter',
    tenantLogo = null,
    linkedStudents = []
}: {
    role?: string,
    userName?: string,
    brandColor?: string,
    tenantName?: string,
    tenantMotto?: string,
    tier?: string,
    tenantLogo?: string | null,
    linkedStudents?: any[]
}) {
    const pathname = usePathname()
    const router = useRouter()

    // Normalize role string
    const normalizedRole = (initialRole || 'student').trim().toLowerCase()
    const roleKey = Object.keys(SIDEBAR_LINKS).includes(normalizedRole)
        ? normalizedRole as UserRole
        : 'student'
    const role = roleKey

    // Cast to grouping type safely
    const categories = SIDEBAR_LINKS[role] as SidebarCategory[]

    // State for Search
    const [openSearch, setOpenSearch] = useState(false)
    const [isSupportOpen, setIsSupportOpen] = useState(false)
    const [isUpgradeOpen, setIsUpgradeOpen] = useState(false)

    // State for Collapsed Categories (Hubs) - Initialize without localStorage to prevent hydration errors
    const [openHub, setOpenHub] = useState<string | null>(() => {
        if (!categories || categories.length === 0) return null
        // Find first non-System category
        const firstHub = categories.find(cat => cat.category !== "System")
        return firstHub?.category || null
    })

    // Restore from localStorage after mount (client-side only)
    useEffect(() => {
        if (typeof window !== 'undefined' && categories && categories.length > 0) {
            const saved = localStorage.getItem('sidebar-open-hub')
            // Only restore if it's not "System" and exists in categories
            if (saved && saved !== "System" && categories.find(cat => cat.category === saved)) {
                console.log('[SidebarClient] Restored hub from localStorage:', saved)
                setOpenHub(saved)
            }
        }
    }, []) // Run once on mount

    // Save to localStorage when hub changes (but never save "System")
    useEffect(() => {
        if (openHub && openHub !== "System" && typeof window !== 'undefined') {
            localStorage.setItem('sidebar-open-hub', openHub)
        }
    }, [openHub])

    // Debug logging
    useEffect(() => {
        console.log('[SidebarClient] Mounted', {
            role,
            categoriesCount: categories?.length,
            openHub,
            categoryNames: categories?.map(c => c.category)
        })
    }, [role, categories, openHub])

    // Effect: Sync logic for client-side navigation updates
    useEffect(() => {
        if (!categories || categories.length === 0) return

        // Find active category based on current path (but never auto-open System)
        const activeCategory = categories.find(cat =>
            cat.category !== "System" && cat.items?.some(item =>
                item.href === '/dashboard' ? pathname === item.href : pathname.startsWith(item.href)
            )
        )

        if (activeCategory && openHub !== activeCategory.category) {
            setOpenHub(activeCategory.category)
        }
    }, [pathname, categories]) // Removed openHub to prevent loop

    // Toggle Hub
    const toggleHub = (hubName: string) => {
        console.log('[SidebarClient] Toggle hub:', hubName, 'Current:', openHub)
        setOpenHub(prev => prev === hubName ? null : hubName)
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

    // Determine if tier is premium
    const isPremium = tier === 'platinum' || tier === 'pilot'

    const [logoError, setLogoError] = useState(false)

    return (
        <TooltipProvider>
            <div className="flex flex-col h-full">
                {/* 🛡️ Identity Section */}
                <div className="px-4 pt-4 pb-4 border-b border-white/5">
                    {/* Logo */}
                    <div className="flex items-center gap-3 mb-4">
                        <div className="h-12 w-12 rounded-xl bg-slate-900/50 border border-white/10 flex items-center justify-center overflow-hidden">
                            {tenantLogo && !logoError ? (
                                <img
                                    src={tenantLogo}
                                    alt={tenantName}
                                    className="h-full w-full object-contain p-1"
                                    onError={() => setLogoError(true)}
                                />
                            ) : (
                                <span className="text-2xl">🎓</span>
                            )}
                        </div>
                        <div className="flex-1">
                            <h2 className="text-white font-bold text-lg tracking-tight leading-tight">{tenantName}</h2>
                            <p className="text-xs font-semibold mt-0.5 opacity-80" style={{ color: 'var(--school-accent)' }}>{tenantMotto}</p>
                        </div>
                    </div>


                </div>

                {/* 👨👩👧👦 Student Switcher (Parent Only) */}
                {role === 'parent' && linkedStudents && linkedStudents.length > 0 && (
                    <div className="border-b border-white/5">
                        <StudentSwitcher students={linkedStudents} />
                    </div>
                )}



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
                                        <item.icon className="mr-2 h-4 w-4" strokeWidth={1.5} />
                                        <span>{item.label}</span>
                                    </CommandItem>
                                ))}
                            </CommandGroup>
                        ))}
                    </CommandList>
                </CommandDialog>

                <UpgradeModal
                    isOpen={isUpgradeOpen}
                    onClose={() => setIsUpgradeOpen(false)}
                    currentTier={tier}
                    tenantName={tenantName}
                />

                <SupportModal
                    isOpen={isSupportOpen}
                    onClose={() => setIsSupportOpen(false)}
                    tenantName={tenantName}
                />

                {/* 🏛️ Navigation Hubs */}
                <nav className="flex-1 overflow-y-auto px-4 pb-4 space-y-2 scrollbar-thin scrollbar-thumb-slate-800">
                    {categories.map((cat, index) => {
                        const isSystem = cat.category === "System"
                        if (isSystem) return null

                        // Safety check: skip if no items
                        if (!cat.items || cat.items.length === 0) return null

                        const isOpen = openHub === cat.category
                        const Icon = cat.icon

                        // Check if this hub has the active link
                        const hasActiveLink = cat.items.some(item =>
                            item.href === '/dashboard' ? pathname === item.href : pathname.startsWith(item.href)
                        )

                        return (
                            <div key={cat.category} className="mb-2">
                                {/* Hub Header */}
                                <button
                                    onClick={() => toggleHub(cat.category)}
                                    className={cn(
                                        "w-full flex items-center justify-between p-3 rounded-xl transition-all duration-200",
                                        isOpen || hasActiveLink
                                            ? "bg-white/5"
                                            : "text-slate-400 hover:bg-white/5 hover:text-white"
                                    )}
                                >
                                    <div className="flex items-center gap-3" style={isOpen || hasActiveLink ? { color: 'var(--school-accent)' } : undefined}>
                                        {Icon && <Icon size={18} strokeWidth={1.5} />}
                                        <span className="text-sm font-medium tracking-wide">{cat.category}</span>
                                    </div>
                                    <ChevronDown
                                        size={14}
                                        className={cn(
                                            "transition-transform duration-200",
                                            isOpen && "rotate-180"
                                        )}
                                    />
                                </button>

                                {/* Nested Links */}
                                {isOpen && (
                                    <div className="ml-9 mt-2 space-y-1 border-l border-white/10 pl-4 animate-in slide-in-from-top-2 duration-200">
                                        {cat.items.map((item) => {
                                            const ItemIcon = item.icon
                                            const isActive = item.href === '/dashboard'
                                                ? pathname === item.href
                                                : pathname.startsWith(item.href)

                                            const isPremiumFeature = item.badge === 'Premium'

                                            // Tooltip Wrapper for Disabled Items
                                            if (item.disabled) {
                                                return (
                                                    <Tooltip key={item.label} delayDuration={0}>
                                                        <TooltipTrigger asChild>
                                                            <div className="flex items-center gap-3 py-2 text-xs text-slate-600 cursor-not-allowed group/disabled">
                                                                {ItemIcon && <ItemIcon className="h-3.5 w-3.5 opacity-50" strokeWidth={1.5} />}
                                                                <span className="opacity-70 group-hover/disabled:opacity-100 transition-opacity">{item.label}</span>
                                                                {item.badge && (
                                                                    <span className={cn(
                                                                        "ml-auto text-[10px] font-bold px-1.5 py-0.5 rounded border uppercase tracking-wider",
                                                                        isPremiumFeature
                                                                            ? "bg-amber-500/10 text-amber-500 border-amber-500/20 shadow-[0_0_10px_rgba(245,158,11,0.2)]"
                                                                            : "border-slate-700 text-slate-500"
                                                                    )}>
                                                                        {item.badge}
                                                                    </span>
                                                                )}
                                                            </div>
                                                        </TooltipTrigger>
                                                        <TooltipContent side="right" className="bg-slate-900 border-slate-800 text-slate-300">
                                                            <p className="font-semibold text-amber-500 mb-1 flex items-center gap-1">
                                                                <Crown size={12} /> Premium Feature
                                                            </p>
                                                            <p className="text-xs">Contact administration to unlock {item.label}.</p>
                                                        </TooltipContent>
                                                    </Tooltip>
                                                )
                                            }

                                            return (
                                                <Link
                                                    key={item.href}
                                                    href={item.href}
                                                    className={cn(
                                                        "flex items-center gap-3 py-2 text-xs transition-all duration-200",
                                                        isActive
                                                            ? "font-bold tracking-wide"
                                                            : "text-slate-500 hover:text-white"
                                                    )}
                                                    style={isActive ? {
                                                        color: '#3b82f6', // Factory Blue
                                                        textShadow: '0 0 12px rgba(59, 130, 246, 0.5)' // Glow
                                                    } : undefined}
                                                >
                                                    {ItemIcon && <ItemIcon className="h-3.5 w-3.5" strokeWidth={1.5} />}
                                                    <span>{item.label}</span>
                                                </Link>
                                            )
                                        })}
                                    </div>
                                )}
                            </div>
                        )
                    })}
                </nav>

                {/* ⚙️ Footer Meta */}
                <div className="pt-4 px-4 border-t border-white/5 space-y-4 pb-4">
                    {/* 🏦 Family Financial Summary (Parent Only) */}
                    {role === 'parent' && (
                        <div className="bg-slate-900/50 border border-white/5 rounded-xl p-3 mb-2">
                            <p className="text-[9px] font-mono text-slate-500 uppercase tracking-widest mb-1">
                                Total_Family_Balance
                            </p>
                            <p className="text-lg font-bold text-white font-mono tracking-tight">
                                ₦{(linkedStudents?.reduce((sum, s) => sum + (s.school_fees_debt || 0), 0) || 0).toLocaleString()}
                            </p>
                        </div>
                    )}

                    {/* Tier Display */}
                    <div className="flex items-center justify-between px-2">
                        <span className="text-xs font-mono text-slate-600 uppercase tracking-widest">
                            Tier: <span className={cn(isPremium ? "text-amber-500 font-bold" : "text-slate-500")}>
                                {tier.charAt(0).toUpperCase() + tier.slice(1)}
                            </span>
                        </span>
                        {isPremium ? (
                            <ShieldCheck size={14} style={{ color: 'rgb(var(--school-accent-rgb) / 0.5)' }} />
                        ) : (
                            <div className="h-1.5 w-1.5 rounded-full bg-slate-700" />
                        )}
                    </div>

                    {/* System Links */}
                    {categories.find(c => c.category === "System")?.items?.map(item => {
                        const ItemIcon = item.icon
                        const isActive = pathname.startsWith(item.href)
                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                className={cn(
                                    "w-full flex items-center gap-3 p-3 rounded-xl transition-all duration-200",
                                    isActive
                                        ? "bg-blue-500/10 border border-blue-500/20"
                                        : "text-slate-400 hover:text-white hover:bg-white/5"
                                )}
                                style={isActive ? {
                                    color: '#3b82f6',
                                    boxShadow: '0 0 15px rgba(59, 130, 246, 0.15)',
                                    textShadow: '0 0 10px rgba(59, 130, 246, 0.4)'
                                } : undefined}
                            >
                                <ItemIcon size={18} strokeWidth={1.5} />
                                <span className="text-sm">{item.label}</span>
                            </Link>
                        )
                    })}

                    {/* Dynamic Upgrade Button (Non-Premium Admins Only) */}
                    {!isPremium && (normalizedRole === 'admin' || normalizedRole === 'owner' || normalizedRole === 'proprietor') && (
                        <button
                            onClick={() => {
                                toast.info("Institutional Expansion Protocols Active", {
                                    description: "Initializing Tier Selection Console...",
                                })
                                setIsUpgradeOpen(true)
                            }}
                            className="group relative w-full overflow-hidden p-[1px] rounded-xl transition-all duration-500 hover:scale-[1.02] active:scale-95 shadow-[0_0_20px_rgba(34,211,238,0.1)] active:shadow-none"
                        >
                            {/* Animated Background Pulse */}
                            <div className="absolute inset-0 bg-gradient-to-r from-cyan-500 via-amber-500 to-cyan-500 animate-gradient-x opacity-30 group-hover:opacity-100 transition-opacity" />

                            <div className="relative flex items-center justify-center p-3 bg-slate-950 rounded-[11px] h-full group-hover:bg-slate-950/80 backdrop-blur-sm transition-colors">
                                <div className="flex flex-col items-center">
                                    <span className="text-[11px] font-black uppercase tracking-widest text-white leading-none">Upgrade Now</span>
                                    <span className="text-[9px] font-bold text-cyan-400/60 uppercase tracking-tighter mt-1 group-hover:text-cyan-300 transition-colors">Unlock Platinum Hub</span>
                                </div>
                                <ChevronDown size={14} className="absolute right-3 text-slate-600 -rotate-90 group-hover:translate-x-1 group-hover:text-cyan-400 transition-all" />
                            </div>
                        </button>
                    )}

                    <button
                        onClick={() => {
                            toast.info("Support Protocol Initiated", {
                                description: "Connecting to Platinum Support Terminal...",
                            })
                            setIsSupportOpen(true)
                        }}
                        className="w-full flex items-center gap-3 p-3 text-slate-400 hover:text-white hover:bg-white/5 rounded-xl transition-all"
                    >
                        <HelpCircle size={18} strokeWidth={1.5} />
                        <span className="text-sm">Help & Support</span>
                    </button>
                </div>
            </div>
        </TooltipProvider>
    )
}
