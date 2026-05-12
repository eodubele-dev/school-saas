"use client"

import Link from "next/link"
import { usePathname, useRouter, useSearchParams } from "next/navigation"
import { cn } from "@/lib/utils"
import { useState, useEffect, useTransition, useMemo } from "react"
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
import { useTranslation } from "@/lib/hooks/use-translation"
import { getUnreadMessageCount } from "@/lib/actions/communication"
import { createClient } from "@/lib/supabase/client"
import { useOfflineVault } from "@/components/providers/offline-vault-provider"
import { Database } from "lucide-react"
import { SubscriptionTier, TIER_RANK } from "@/config/subscriptions"


export function SidebarClient({
    role: initialRole = 'student',
    userName = 'Guest User',
    brandColor = '#3b82f6',
    tenantName = 'EduFlow',
    tenantMotto = 'Excellence in Education',
    tier = 'starter',
    tenantLogo = null,
    linkedStudents = [],
    permissions = null,
    basePath = ''
}: {
    role?: string,
    userName?: string,
    brandColor?: string,
    tenantName?: string,
    tenantMotto?: string,
    tier?: string,
    tenantLogo?: string | null,
    linkedStudents?: any[],
    permissions?: any,
    basePath?: string
}) {
    const pathname = usePathname()
    const searchParams = useSearchParams()
    const router = useRouter()
    const { isOnline, isSynced, lastSync } = useOfflineVault()
    const [unreadCount, setUnreadCount] = useState(0)
    const [pendingHref, setPendingHref] = useState<string | null>(null)
    const [isPending, startTransition] = useTransition()

    // Sync transition state with global loading bar if needed
    useEffect(() => {
        if (!isPending) {
            setPendingHref(null)
            window.dispatchEvent(new CustomEvent('navigation-end'))
        }
    }, [isPending])

    // Aggressively clear pending state when the URL changes (this is the most reliable method in Next.js App Router)
    useEffect(() => {
        setPendingHref(null)
        window.dispatchEvent(new CustomEvent('navigation-end'))
    }, [pathname, searchParams])

    // Fail-safe: Clear visual loading state after 5 seconds if React transition hangs (rare, but good for UX)
    useEffect(() => {
        if (!pendingHref) return
        const timer = setTimeout(() => {
            console.warn('[SidebarClient] Fail-safe triggered: Clearing stuck pendingHref after 5s')
            setPendingHref(null)
        }, 5000)
        return () => clearTimeout(timer)
    }, [pendingHref])

    // Normalize role string
    const normalizedRole = (initialRole || 'student').trim().toLowerCase()
    const roleKey = Object.keys(SIDEBAR_LINKS).includes(normalizedRole)
        ? normalizedRole as UserRole
        : 'student'
    const role = roleKey

    // Cast to grouping type safely
    const baseCategories = SIDEBAR_LINKS[role] as SidebarCategory[]

    // Perspective Enforcement Logic (Memoized to prevent infinite useEffect triggers)
    const categories = useMemo(() => {
        const cats = [...baseCategories]

        // 1. Financial Records for Staff
        if (permissions?.can_view_financials && role !== 'admin' && role !== 'bursar' && role !== 'owner') {
            const financialSuite = (SIDEBAR_LINKS['bursar'] as SidebarCategory[]).find(c => c.category === "Financial Suite")
            if (financialSuite && !cats.find(c => c.category === "Financial Suite")) {
                cats.push(financialSuite)
            }
        }

        // 2. Results Editing (for Teachers - though they usually have it, this ensures it)
        if (permissions?.can_edit_results && role === 'teacher') {
            // Teachers already have assessments, but we could add specific admin result tools if needed.
        }

        // 3. Bulk SMS (Link to communication hub or specific tools)
        if (permissions?.can_send_bulk_sms && !cats.find(c => c.items?.some(i => i.href.includes('messages')))) {
            // Typically handled via role, but can be added here
        }

        return cats
    }, [baseCategories, permissions, role])

    const [openSearch, setOpenSearch] = useState(false)
    const [isSupportOpen, setIsSupportOpen] = useState(false)
    const [logoError, setLogoError] = useState(false)

    // State for Collapsed Categories (Hubs) - Initialize without localStorage to prevent hydration errors
    const [openHub, setOpenHub] = useState<string | null>(null)
    const { t } = useTranslation()

    // Restore from localStorage after mount (client-side only)
    useEffect(() => {
        if (typeof window !== 'undefined' && categories && categories.length > 0) {
            const saved = localStorage.getItem('sidebar-open-hub')
            // Only restore if it's not "System" and exists in categories
            if (saved && saved !== "System" && categories.find(cat => cat.category === saved)) {
                console.log('[SidebarClient] Restored hub from localStorage:', saved)
                setOpenHub(saved)
            } else {
                // If no saved hub or it's invalid, find the first non-System category
                const firstHub = categories.find(cat => cat.category !== "System")
                setOpenHub(firstHub?.category || null)
            }
        }

        // Initialize supabase
        const supabase = createClient()

        // Fetch unread count
        const fetchUnread = async () => {
            if (typeof window !== "undefined" && (window as any).__EDUFLOW_KIOSK_LOCKING__) return
            const res = await getUnreadMessageCount()
            if (res && res.success) setUnreadCount(res.count)
        }
        fetchUnread()

        // Real-time subscription for global unread count
        const channel = supabase
            .channel('global-unread-count')
            .on(
                'postgres_changes',
                {
                    event: '*', // Listen for all changes (Mark as read, delete, new messages)
                    schema: 'public',
                    table: 'chat_messages'
                },
                () => {
                    fetchUnread()
                }
            )
            .subscribe()

        // Polling for unread messages (Backup)
        const interval = setInterval(fetchUnread, 60000)
        return () => {
            clearInterval(interval)
            supabase.removeChannel(channel)
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
            cat.category !== "System" && cat.items?.some(item => {
                const fullItemHref = basePath ? `${basePath}${item.href}` : item.href
                const normalizedPath = pathname?.replace(/\/$/, '') || '/'
                const normalizedHref = fullItemHref.replace(/\/$/, '') || '/'
                return item.href === '/dashboard' ? normalizedPath === normalizedHref : normalizedPath.startsWith(normalizedHref)
            })
        )

        if (activeCategory && openHub !== activeCategory.category) {
            setOpenHub(activeCategory.category)
        }
    }, [pathname, categories])

    // Toggle Hub
    const toggleHub = (hubName: string) => {
        console.log('[SidebarClient] Toggle hub:', hubName, 'Current:', openHub)
        setOpenHub(prev => prev === hubName ? null : hubName)
    }

    // Guided Tour Event Listener
    useEffect(() => {
        const handleTourStep = (e: CustomEvent) => {
            if (!categories) return
            const href = e.detail?.href
            if (!href) return

            // Find the category containing this href
            const targetCategory = categories.find(cat =>
                cat.items?.some(item => item.href === href || href.startsWith(item.href))
            )
            
            if (targetCategory && openHub !== targetCategory.category) {
                setOpenHub(targetCategory.category)
            }

            // Remove existing highlights
            document.querySelectorAll('.tour-highlight').forEach(el => el.classList.remove('tour-highlight', 'ring-2', 'ring-amber-500', 'ring-offset-2', 'ring-offset-slate-900', 'z-50', 'bg-amber-500/20'))
            
            // Wait for React to render the newly opened hub, then highlight
            setTimeout(() => {
                const el = document.querySelector(`[data-tour="${href}"]`)
                if (el) {
                    el.classList.add('tour-highlight', 'ring-2', 'ring-amber-500', 'ring-offset-2', 'ring-offset-slate-900', 'z-50', 'bg-amber-500/20', 'rounded-lg')
                    el.scrollIntoView({ behavior: 'smooth', block: 'center' })
                }
            }, 300)
        }

        const handleTourEnd = () => {
             document.querySelectorAll('.tour-highlight').forEach(el => el.classList.remove('tour-highlight', 'ring-2', 'ring-amber-500', 'ring-offset-2', 'ring-offset-slate-900', 'z-50', 'bg-amber-500/20', 'rounded-lg'))
        }

        window.addEventListener('tour-step' as any, handleTourStep)
        window.addEventListener('tour-end' as any, handleTourEnd)
        return () => {
            window.removeEventListener('tour-step' as any, handleTourStep)
            window.removeEventListener('tour-end' as any, handleTourEnd)
        }
    }, [categories, openHub])

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
        const fullHref = basePath ? `${basePath}${href}` : href
        router.push(fullHref)
        setOpenSearch(false)
    }

    if (!categories || categories.length === 0) {
        return (
            <div className="flex flex-col h-full bg-transparent border-r border-border/50 p-4 text-muted-foreground text-sm">
                <AlertCircle className="mb-2 h-6 w-6 text-red-500" />
                No navigation items found for role: {role}
            </div>
        )
    }

    // Determine if tier is premium
    const currentTierRank = TIER_RANK[tier as keyof typeof TIER_RANK] || 1
    const isPremium = currentTierRank >= TIER_RANK['professional']
    const isPlatinum = tier === 'platinum'

    return (
        <TooltipProvider>
            <div className="flex flex-col h-full">
                {/* 🛡️ Identity Section */}
                <div className="px-4 pt-4 pb-4 border-b border-border/50 shrink-0 min-h-min z-20 bg-inherit relative">
                    {/* Logo & Identity */}
                    <div className="flex items-start gap-4 py-2">
                        <div className="h-14 w-14 shrink-0 bg-white rounded-xl shadow-[0_8px_20px_rgba(0,0,0,0.2)] border border-white/20 p-1 flex items-center justify-center relative z-20">
                            {tenantLogo && !logoError ? (
                                <img
                                    src={tenantLogo}
                                    alt={tenantName}
                                    className="h-full w-full object-contain p-0.5"
                                    onError={() => setLogoError(true)}
                                />
                            ) : (
                                <img
                                    src="/visuals/auth-logo.png"
                                    alt="Identity Verified"
                                    className="h-full w-full object-contain p-0.5"
                                />
                            )}
                        </div>
                        <div className="flex-1 min-w-0 pt-0.5">
                            <h2 className="text-foreground font-black text-lg tracking-wide leading-tight break-words drop-shadow-md">{tenantName}</h2>
                            <p className="text-[10px] font-bold mt-1.5 opacity-90 tracking-widest uppercase break-words leading-snug" style={{ color: 'var(--school-accent)' }}>{tenantMotto}</p>
                        </div>
                    </div>


                </div>

                {/* 👨👩👧👦 Student Switcher (Parent Only) */}
                {role === 'parent' && linkedStudents && linkedStudents.length > 0 && (
                    <div className="border-b border-border/50">
                        <StudentSwitcher students={linkedStudents} />
                    </div>
                )}



                {/* Command Palette Dialog */}
                <CommandDialog open={openSearch} onOpenChange={setOpenSearch}>
                    <CommandInput placeholder="Search modules (e.g. Bus, Fees, Staff)..." />
                    <CommandList>
                        <CommandEmpty>No results found.</CommandEmpty>
                        {categories.map((cat) => (
                            <CommandGroup key={cat.category} heading={t(cat.category)}>
                                {cat.items?.map((item) => (
                                    <CommandItem
                                        key={item.href}
                                        value={`${t(cat.category)} ${t(item.label)}`}
                                        onSelect={() => handleSearchSelect(item.href)}
                                    >
                                        <item.icon className="mr-2 h-4 w-4" strokeWidth={1.5} />
                                        <span>{t(item.label)}</span>
                                    </CommandItem>
                                ))}
                            </CommandGroup>
                        ))}
                    </CommandList>
                </CommandDialog>

                <SupportModal
                    isOpen={isSupportOpen}
                    onClose={() => setIsSupportOpen(false)}
                    tenantName={tenantName}
                />

                {/* 🏛️ Navigation Hubs */}
                <nav className="flex-1 overflow-y-auto px-4 pb-40 pt-4 space-y-2 scrollbar-thin scrollbar-thumb-slate-800 z-10">
                    {categories.map((cat, index) => {
                        const isSystem = cat.category === "System"
                        if (isSystem) return null

                        // Safety check: skip if no items
                        if (!cat.items || cat.items.length === 0) return null

                        const isOpen = openHub === cat.category
                        const Icon = cat.icon

                        // Check if this hub has the active link
                        const hasActiveLink = pathname && cat.items.some(item =>
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
                                            ? "bg-secondary/50"
                                            : "text-muted-foreground hover:bg-secondary/50 hover:text-foreground"
                                    )}
                                >
                                    <div className="flex items-center gap-3" style={isOpen || hasActiveLink ? { color: 'var(--school-accent)' } : undefined}>
                                        {Icon && <Icon size={18} strokeWidth={1.5} />}
                                        <span className="text-sm font-medium tracking-wide">{t(cat.category)}</span>
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
                                    <div className="ml-[1.1rem] mt-1 space-y-0.5 border-l-2 border-border/80 hover:border-indigo-500/50 transition-colors pl-4 animate-in slide-in-from-top-2 duration-200">
                                        {cat.items.map((item) => {
                                            const ItemIcon = item.icon
                                            const fullHref = basePath ? `${basePath}${item.href}` : item.href

                                            // Preserving search params (like studentId) for sub-navigation
                                            const currentStudentId = searchParams.get('studentId')
                                            const linkHref = currentStudentId 
                                                ? `${fullHref}${fullHref.includes('?') ? '&' : '?'}studentId=${currentStudentId}`
                                                : fullHref

                                            // Normalize paths for more robust active/click comparison
                                            const normalizedPath = pathname?.replace(/\/$/, '') || '/'
                                            const normalizedHref = fullHref.replace(/\/$/, '') || '/'

                                            const isActive = pathname && (fullHref === (basePath ? `${basePath}/dashboard` : '/dashboard')
                                                ? normalizedPath === normalizedHref
                                                : normalizedPath.startsWith(normalizedHref))

                                            const requiredTier = item.requiredTier
                                            const isLockedByTier = requiredTier && (TIER_RANK[tier as keyof typeof TIER_RANK] || 0) < (TIER_RANK[requiredTier as keyof typeof TIER_RANK] || 0)
                                            const isDisabled = item.disabled || isLockedByTier
                                            const isPremiumFeature = item.badge === 'Premium' || (requiredTier && TIER_RANK[requiredTier] >= TIER_RANK['professional'])

                                            // Tooltip Wrapper for Disabled/Locked Items
                                            if (isDisabled) {
                                                return (
                                                    <Tooltip key={item.label} delayDuration={0}>
                                                        <TooltipTrigger asChild>
                                                            <div className="flex items-center gap-3 py-2 text-xs text-slate-600 cursor-not-allowed group/disabled">
                                                                {ItemIcon && <ItemIcon className="h-3.5 w-3.5 opacity-50" strokeWidth={1.5} />}
                                                                <span className="opacity-70 group-hover/disabled:opacity-100 transition-opacity">{t(item.label)}</span>
                                                                {item.badge && (
                                                                    <span className={cn(
                                                                        "ml-auto text-[10px] font-bold px-1.5 py-0.5 rounded border uppercase tracking-wider",
                                                                        isPremiumFeature
                                                                            ? "bg-amber-500/10 text-amber-500 border-amber-500/20 shadow-[0_0_10px_rgba(245,158,11,0.2)]"
                                                                            : "border-slate-700 text-muted-foreground"
                                                                    )}>
                                                                        {item.badge}
                                                                    </span>
                                                                )}
                                                            </div>
                                                        </TooltipTrigger>
                                                        <TooltipContent side="right" className="bg-card text-card-foreground border-border text-slate-300">
                                                            <p className="font-semibold text-amber-500 mb-1 flex items-center gap-1 text-[10px] uppercase tracking-tighter">
                                                                <Crown size={12} /> {isLockedByTier ? `${requiredTier?.toUpperCase()} UPGRADE REQUIRED` : 'Premium Module'}
                                                            </p>
                                                            <p className="text-[10px] opacity-80 leading-relaxed uppercase tracking-widest font-bold">
                                                                {isLockedByTier 
                                                                    ? `This module is restricted to ${requiredTier} institutions.` 
                                                                    : `Contact administration to unlock ${t(item.label)}.`}
                                                            </p>
                                                        </TooltipContent>
                                                    </Tooltip>
                                                )
                                            }

                                            return (
                                                <Link
                                                    key={fullHref}
                                                    href={linkHref}
                                                    prefetch={false}
                                                    data-tour={item.href}
                                                    onClick={(e) => {
                                                        const normalizedPath = pathname?.replace(/\/$/, '') || '/'
                                                        const targetPath = linkHref.replace(/\/$/, '') || '/'

                                                        if (targetPath !== normalizedPath) {
                                                            e.preventDefault() // Stop default link behavior
                                                            e.stopPropagation() // Stop event bubbling
                                                            setPendingHref(linkHref)
                                                            window.dispatchEvent(new CustomEvent('navigation-start'))
                                                            startTransition(() => {
                                                                router.push(linkHref)
                                                            })
                                                        } else {
                                                            // If we are already on this path, ensure we aren't stuck loading
                                                            setPendingHref(null)
                                                            window.dispatchEvent(new CustomEvent('navigation-end'))
                                                        }
                                                    }}
                                                    className={cn(
                                                        "flex items-center gap-3 py-2 px-3 -ml-3 rounded-lg text-xs transition-all duration-200 group relative overflow-hidden",
                                                        isActive
                                                            ? "bg-indigo-500/10 text-indigo-400 font-bold tracking-wide shadow-[inset_2px_0_0_0_rgba(99,102,241,1)]"
                                                            : "text-muted-foreground hover:text-indigo-300 hover:bg-indigo-500/5 hover:shadow-[inset_2px_0_0_0_rgba(99,102,241,0.5)]",
                                                        pendingHref === fullHref && "opacity-70 animate-pulse"
                                                    )}
                                                >
                                                    {pendingHref === fullHref ? (
                                                        <div className="h-4 w-4 border-2 border-indigo-400 border-t-transparent rounded-full animate-spin" />
                                                    ) : (
                                                        ItemIcon && <ItemIcon className={cn("h-4 w-4 transition-transform duration-200", !isActive && "group-hover:scale-110")} strokeWidth={isActive ? 2 : 1.5} />
                                                    )}
                                                    <span>{t(item.label)}</span>
                                                    {item.href === '/dashboard/messages' && unreadCount > 0 && (
                                                        <span className="ml-auto bg-blue-500 text-foreground text-[10px] font-bold px-1.5 py-0.5 rounded-full ring-2 ring-slate-950 shadow-[0_0_10px_rgba(59,130,246,0.5)]">
                                                            {unreadCount}
                                                        </span>
                                                    )}
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
                <div className="pt-4 px-4 border-t border-border/50 space-y-4 pb-4">
                    {/* 🏦 Family Financial Summary (Parent Only) */}
                    {role === 'parent' && (
                        <div className="relative overflow-hidden rounded-2xl mb-4 group transition-all duration-300 hover:shadow-[0_0_30px_rgba(59,130,246,0.15)]">
                            <div className="absolute inset-0 bg-gradient-to-br from-blue-600/20 via-indigo-600/20 to-purple-600/20 opacity-30 group-hover:opacity-50 transition-opacity" />
                            <div className="absolute inset-0 bg-slate-950/50 backdrop-blur-xl" />
                            <div className="relative p-4 border border-border rounded-2xl bg-gradient-to-b from-white/5 to-transparent">
                                <div className="flex justify-between items-start mb-2">
                                    <div className="flex items-center gap-2">
                                        <div className="p-1.5 bg-blue-500/20 rounded-md">
                                            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-blue-400"><rect width="20" height="14" x="2" y="5" rx="2" /><line x1="2" x2="22" y1="10" y2="10" /></svg>
                                        </div>
                                        <p className="text-[10px] font-bold text-slate-300 uppercase tracking-wider">
                                            {t('Family Balance')}
                                        </p>
                                    </div>
                                    <span className="flex h-2 w-2 rounded-full bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.8)] animate-pulse" />
                                </div>
                                <div className="mt-1">
                                    <p className="text-2xl font-black text-foreground tabular-nums tracking-tight">
                                        ₦{Math.max(0, (linkedStudents?.reduce((sum, s) => sum + (s.school_fees_debt || 0), 0) || 0)).toLocaleString()}
                                    </p>
                                </div>
                                {((linkedStudents?.reduce((sum, s) => sum + (s.school_fees_debt || 0), 0) || 0) > 0) ? (
                                    <Link 
                                        href={basePath ? `${basePath}/dashboard/billing/family` : "/dashboard/billing/family"} 
                                        prefetch={false} 
                                        onClick={(e) => {
                                            const normalizedPath = pathname?.replace(/\/$/, '') || '/'
                                            const targetPath = basePath ? `${basePath}/dashboard/billing/family` : '/dashboard/billing/family'
                                            if (normalizedPath !== targetPath) {
                                            e.preventDefault()
                                            e.stopPropagation()
                                            setPendingHref(targetPath)
                                            window.dispatchEvent(new CustomEvent('navigation-start'))
                                            startTransition(() => {
                                                router.push(targetPath)
                                            })
                                        } else {
                                            setPendingHref(null)
                                        }
                                    }} className="mt-4 flex w-full items-center justify-center gap-2 bg-blue-500 hover:bg-blue-600 text-foreground shadow-[0_0_15px_rgba(59,130,246,0.4)] py-1.5 rounded-lg text-xs font-bold transition-all hover:scale-[1.02]">
                                        Pay Fees Now
                                    </Link>
                                ) : (
                                    <div className="mt-4 flex w-full items-center justify-center gap-2 bg-emerald-500/10 text-emerald-400 py-1.5 rounded-lg text-xs font-bold ring-1 ring-emerald-500/20">
                                        All Fees Cleared
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Tier Display */}
                    <div className="flex items-center justify-between px-2">
                        <span className="text-xs font-mono text-slate-600 uppercase tracking-widest">
                            Tier: <span className={cn(isPremium ? "text-amber-500 font-bold" : "text-muted-foreground")}>
                                {tier.charAt(0).toUpperCase() + tier.slice(1)}
                            </span>
                        </span>
                        {isPremium ? (
                            <ShieldCheck size={14} style={{ color: 'rgb(var(--school-accent-rgb) / 0.5)' }} />
                        ) : (
                            <div className="h-1.5 w-1.5 rounded-full bg-blue-500/80 animate-pulse shadow-[0_0_8px_rgba(59,130,246,0.5)]" />
                        )}
                    </div>

                    {/* 🗄️ Vault Status (Platinum Only) */}
                    {isPremium && (
                        <div className="flex items-center justify-between px-2 pt-1 border-t border-border/20 mt-1">
                            <span className="text-[10px] font-mono text-slate-500 uppercase tracking-widest flex items-center gap-1.5">
                                <Database size={10} className={cn(isSynced ? "text-emerald-500" : "text-amber-500")} />
                                Vault: <span className={cn(isSynced ? "text-emerald-500/80" : "text-amber-500/80")}>
                                    {isSynced ? (isOnline ? "SYNCED" : "OFFLINE READY") : "SYNCING..."}
                                </span>
                            </span>
                            {lastSync && (
                                <span className="text-[9px] text-slate-700 italic">
                                    {lastSync.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </span>
                            )}
                        </div>
                    )}

                    {/* System Links */}
                    {categories.find(c => c.category === "System")?.items?.map(item => {
                        const ItemIcon = item.icon
                        const fullHref = basePath ? `${basePath}${item.href}` : item.href
                        const isActive = pathname?.startsWith(fullHref)
                        return (
                            <Link
                                key={fullHref}
                                href={fullHref}
                                prefetch={false}
                                onClick={(e) => {
                                    const normalizedPath = pathname?.replace(/\/$/, '') || '/'
                                    const normalizedHref = fullHref.replace(/\/$/, '') || '/'

                                    if (normalizedHref !== normalizedPath) {
                                        e.preventDefault()
                                        e.stopPropagation()
                                        setPendingHref(fullHref)
                                        window.dispatchEvent(new CustomEvent('navigation-start'))
                                        startTransition(() => {
                                            router.push(fullHref)
                                        })
                                    } else {
                                        setPendingHref(null)
                                    }
                                }}
                                className={cn(
                                    "w-full flex items-center gap-3 p-3 rounded-xl transition-all duration-200",
                                    isActive
                                        ? "bg-blue-500/10 border border-blue-500/20"
                                        : "text-muted-foreground hover:text-foreground hover:bg-secondary/50"
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



                    {role !== 'student' && role !== 'parent' && (
                        <button
                            onClick={() => {
                                toast.info("Support Protocol Initiated", {
                                    description: "Connecting to Platinum Support Terminal...",
                                })
                                setIsSupportOpen(true)
                            }}
                            className="w-full flex items-center gap-3 p-3 text-muted-foreground hover:text-foreground hover:bg-secondary/50 rounded-xl transition-all"
                        >
                            <HelpCircle size={18} strokeWidth={1.5} />
                            <span className="text-sm">Help & Support</span>
                        </button>
                    )}
                </div>
            </div>
        </TooltipProvider>
    )
}
