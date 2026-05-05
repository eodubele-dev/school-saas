import { LayoutDashboard, CalendarDays, BookOpen, Activity, FileText, MapPin, Users, Settings, GraduationCap, ClipboardCheck, CreditCard, UserCircle, BrainCircuit, MessageSquare, BookCheck as BookOpenCheck, Banknote, Wallet, ShieldCheck, Smartphone, Sparkles, Crown, Bus, Bed, Package, Search, Building2, Landmark, Truck, Shield, Award } from "lucide-react"
import { NairaIcon } from "@/components/ui/naira-icon"

export type UserRole = 'admin' | 'teacher' | 'parent' | 'student' | 'bursar' | 'owner' | 'driver' | 'staff' | 'super-admin'

export type SidebarItem = {
    icon: any
    label: string
    href: string
    disabled?: boolean
    badge?: string
    requiredTier?: 'pilot' | 'starter' | 'professional' | 'platinum'
}

export type SidebarCategory = {
    category: string
    icon?: any
    items: SidebarItem[]
}

// Helper to keep types clean while allowing the structure change
// We will cast this to any or a specific type in the component
export const SIDEBAR_LINKS: Record<UserRole, SidebarCategory[] | SidebarItem[]> = {
    admin: [
        {
            category: "Campus Operations",
            icon: LayoutDashboard,
            items: [
                { icon: LayoutDashboard, label: "Overview", href: "/dashboard" },
                { icon: Crown, label: "Executive View", href: "/dashboard/admin/executive/mobile", requiredTier: 'professional' },
                { icon: CalendarDays, label: "School Calendar", href: "/dashboard/admin/calendar", badge: "New" },
            ]
        },
        {
            category: "People & Records",
            icon: Users,
            items: [
                { icon: Users, label: "Student Enrollment", href: "/dashboard/admin/admissions" },
                { icon: Users, label: "Faculty Directory", href: "/dashboard/admin/staff" },
                { icon: ClipboardCheck, label: "Staff Attendance", href: "/dashboard/admin/attendance/staff" },
                { icon: ShieldCheck, label: "Student Attendance Audit", href: "/dashboard/attendance/audit", badge: "New" },
            ]
        },
        {
            category: "Academic Oversight",
            icon: GraduationCap,
            items: [
                { icon: BookOpen, label: "Academic Setup", href: "/dashboard/admin/setup/academic" },
                { icon: BookOpen, label: "Curriculum Planning", href: "/dashboard/admin/curriculum", badge: "New", requiredTier: 'platinum' },
                { icon: GraduationCap, label: "Result Processor", href: "/dashboard/admin/results/generate", requiredTier: 'starter' },
                { icon: ShieldCheck, label: "Approvals Hub", href: "/dashboard/admin/approvals" },
            ]
        },
        {
            category: "Financial Suite",
            icon: Landmark,
            items: [
                { icon: NairaIcon, label: "Bursar Hub", href: "/dashboard/bursar", requiredTier: 'professional' },
                { icon: CreditCard, label: "Revenue & Collections", href: "/dashboard/bursar/finance/collections", requiredTier: 'professional' },
                { icon: NairaIcon, label: "Financial Config", href: "/dashboard/admin/finance/config", requiredTier: 'starter' },
                { icon: Package, label: "Inventory Hub", href: "/dashboard/admin/inventory", requiredTier: 'professional' },
                { icon: ShieldCheck, label: "Debt Network", href: "/dashboard/bursar/debt-network", badge: "Live" },
            ]
        },
        {
            category: "Campus Logistics",
            icon: Truck,
            items: [
                { icon: Bus, label: "Transport Hub", href: "/dashboard/logistics", requiredTier: 'professional' },
                { icon: Bed, label: "Hostel Management", href: "/dashboard/admin/hostels", requiredTier: 'professional' },
            ]
        },
        {
            category: "Security & Health",
            icon: Shield,
            items: [
                { icon: Activity, label: "System Security", href: "/dashboard/admin/security/audit", requiredTier: 'professional' },
                { icon: ShieldCheck, label: "Gate Control", href: "/dashboard/admin/security/gate", badge: "Live", requiredTier: 'platinum' },
                { icon: Activity, label: "Health & Infirmary", href: "/dashboard/admin/health", badge: "New", requiredTier: 'platinum' },
            ]
        },
        {
            category: "System",
            items: [
                { icon: MessageSquare, label: "Communication Hub", href: "/dashboard/messages", requiredTier: 'professional' },
                { icon: MessageSquare, label: "Voice & Feedback", href: "/dashboard/admin/voice", badge: "New", requiredTier: 'platinum' },
                { icon: Settings, label: "School Settings", href: "/dashboard/settings" },
                { icon: MessageSquare, label: "SMS Notifications", href: "/dashboard/settings/notifications", requiredTier: 'professional' },
            ]
        }
    ],
    owner: [ // Owner sees Admin View but with Global Switcher enabled
        {
            category: "Global Operations",
            icon: LayoutDashboard,
            items: [
                { icon: LayoutDashboard, label: "Global Overview", href: "/dashboard" },
                { icon: Crown, label: "Executive View", href: "/dashboard/owner/executive" },
            ]
        },
        {
            category: "People & Records",
            icon: Users,
            items: [
                { icon: Users, label: "Student Enrollment", href: "/dashboard/admin/admissions" },
                { icon: Users, label: "Faculty Directory", href: "/dashboard/admin/staff" },
                { icon: ClipboardCheck, label: "Staff Attendance", href: "/dashboard/admin/attendance/staff" },
                { icon: ShieldCheck, label: "Student Attendance Audit", href: "/dashboard/attendance/audit", badge: "New" },
            ]
        },
        {
            category: "Academic Oversight",
            icon: GraduationCap,
            items: [
                { icon: BookOpen, label: "Academic Setup", href: "/dashboard/admin/setup/academic" },
                { icon: BookOpen, label: "Curriculum Planning", href: "/dashboard/admin/curriculum", badge: "New" },
                { icon: GraduationCap, label: "Result Processor", href: "/dashboard/admin/results/generate" },
                { icon: ShieldCheck, label: "Approvals Hub", href: "/dashboard/admin/approvals" },
            ]
        },
        {
            category: "Financial Suite",
            icon: Landmark,
            items: [
                { icon: NairaIcon, label: "Bursar Hub", href: "/dashboard/bursar" },
                { icon: CreditCard, label: "Revenue & Collections", href: "/dashboard/bursar/finance/collections" },
                { icon: NairaIcon, label: "Financial Config", href: "/dashboard/admin/finance/config" },
                { icon: Package, label: "Inventory Hub", href: "/dashboard/admin/inventory" },
                { icon: ShieldCheck, label: "Debt Network", href: "/dashboard/bursar/debt-network", badge: "Live" },
            ]
        },
        {
            category: "Campus Logistics",
            icon: Truck,
            items: [
                { icon: Bus, label: "Transport Hub", href: "/dashboard/logistics" },
                { icon: Bed, label: "Hostel Management", href: "/dashboard/admin/hostels" },
            ]
        },
        {
            category: "Security & Health",
            icon: Shield,
            items: [
                { icon: Activity, label: "System Security", href: "/dashboard/admin/security/audit" },
                { icon: ShieldCheck, label: "Gate Control", href: "/dashboard/admin/security/gate", badge: "Live" },
                { icon: Activity, label: "Health & Infirmary", href: "/dashboard/admin/health", badge: "New" },
            ]
        },
        {
            category: "System",
            items: [
                { icon: MessageSquare, label: "Communication Hub", href: "/dashboard/messages" },
                { icon: MessageSquare, label: "Voice & Feedback", href: "/dashboard/admin/voice", badge: "New" },
                { icon: Settings, label: "School Settings", href: "/dashboard/settings" },
                { icon: MessageSquare, label: "SMS Notifications", href: "/dashboard/settings/notifications" },
            ]
        }
    ],
    // Keep other roles flat for now, or group them if needed later. 
    // The component will handle both flat headers and grouped categories to avoid breaking other roles.
    bursar: [
        {
            category: "Financial Suite",
            items: [
                { icon: LayoutDashboard, label: "Overview", href: "/dashboard/bursar" },
                { icon: CreditCard, label: "Revenue & Collections", href: "/dashboard/bursar/finance/collections" },
                { icon: Banknote, label: "Payroll", href: "/dashboard/bursar/finance/payroll" },
                { icon: Wallet, label: "Expenses & P&L", href: "/dashboard/bursar/finance/expenses" },
                { icon: NairaIcon, label: "Financial Config", href: "/dashboard/bursar/finance/config" },
                { icon: FileText, label: "Invoices", href: "/dashboard/bursar/finance/invoices" },
                { icon: CreditCard, label: "Transactions", href: "/dashboard/bursar/finance/transactions" },
                { icon: ShieldCheck, label: "Debt Network", href: "/dashboard/bursar/debt-network", badge: "Live" },
            ]
        },
    ],
    // Teacher etc kept flat for simplicity or grouped as 'General'
    teacher: [
        {
            category: "Teaching",
            items: [
                { icon: LayoutDashboard, label: "Overview", href: "/dashboard" },
                { icon: Users, label: "My Classes", href: "/dashboard/teacher/classes" },
                { icon: BookOpen, label: "Curriculum Planning", href: "/dashboard/admin/curriculum", badge: "New" },
                { icon: BookOpenCheck, label: "Assessment Hub", href: "/dashboard/teacher/assessments" },
                { icon: Sparkles, label: "Behavior & Awards", href: "/dashboard/teacher/behavior" },
                { icon: ClipboardCheck, label: "Attendance", href: "/dashboard/attendance" },
                { icon: FileText, label: "Lesson Plans", href: "/dashboard/teacher/lesson-plans" },
                { icon: MessageSquare, label: "Communication Hub", href: "/dashboard/messages" },
                { icon: CalendarDays, label: "Academic Calendar", href: "/dashboard/calendar" },
                { icon: Smartphone, label: "Mobile App View", href: "/mobile/teacher" },
            ]
        }
    ],
    driver: [
        {
            category: "Operations",
            items: [
                { icon: LayoutDashboard, label: "Overview", href: "/dashboard" },
                { icon: Bus, label: "My Routes", href: "/dashboard/logistics" },
                { icon: MessageSquare, label: "Messages", href: "/dashboard/messages" },
            ]
        }
    ],
    staff: [
        {
            category: "Operations",
            items: [
                { icon: LayoutDashboard, label: "Overview", href: "/dashboard" },
                { icon: Bus, label: "Transport Hub", href: "/dashboard/logistics" },
                { icon: ShieldCheck, label: "Gate Control", href: "/dashboard/admin/security/gate", badge: "Live" },
                { icon: Activity, label: "Health & Infirmary", href: "/dashboard/admin/health", badge: "New" },
                { icon: MessageSquare, label: "Messages", href: "/dashboard/messages" },
            ]
        }
    ],
    parent: [
        {
            category: "General", items: [
                { icon: LayoutDashboard, label: "Overview", href: "/dashboard" },
                { icon: ShieldCheck, label: "Attendance Audit", href: "/dashboard/attendance/audit", badge: "New" },
                { icon: UserCircle, label: "Child Profile", href: "/dashboard/profile" },
                { icon: FileText, label: "Result Checker", href: "/dashboard/results" },
                { icon: CreditCard, label: "School Fees", href: "/dashboard/billing/family" },
                { icon: CalendarDays, label: "School Calendar", href: "/dashboard/calendar" },
                { icon: MapPin, label: "Bus Tracker", href: "/dashboard/bus-tracker", requiredTier: 'professional', badge: "Premium" },
                { icon: BookOpen, label: "Academics", href: "/dashboard/academics" },
                { icon: Crown, label: "Platinum Concierge", href: "/dashboard/platinum", badge: "New", requiredTier: 'platinum' },
                { icon: MessageSquare, label: "Messages", href: "/dashboard/messages" },
            ]
        }
    ],
    student: [
        {
            category: "Academic & Growth",
            items: [
                { icon: LayoutDashboard, label: "Overview", href: "/dashboard" }, // Command Center
                { icon: Award, label: "Growth Portfolio", href: "/dashboard/student/portfolio", badge: "New" }, // Behavioral & Badges
                { icon: BookOpen, label: "My Results", href: "/dashboard/student/results" }, // Academic Performance
                { icon: BrainCircuit, label: "CBT Practice", href: "/dashboard/student/cbt/practice", badge: "Live" },
                { icon: FileText, label: "Assignments", href: "/dashboard/student/assignments" }, // Tasks
            ]
        },
        {
            category: "Campus Life",
            items: [
                { icon: ShieldCheck, label: "Attendance Status", href: "/dashboard/student/attendance" }, // Geofence & Presence
                { icon: CalendarDays, label: "School Calendar", href: "/dashboard/student/calendar" }, // Events & Exams
                { icon: BookOpen, label: "Learning Resources", href: "/dashboard/student/learning" }, // Notes & Materials
                { icon: CalendarDays, label: "Timetable", href: "/dashboard/student/timetable" },
                { icon: UserCircle, label: "My Profile", href: "/dashboard/student/profile" },
            ]
        }
    ],
    "super-admin": [ // Global Platform Developer/Owner
        {
            category: "Platform Control",
            icon: ShieldCheck,
            items: [
                { icon: ShieldCheck, label: "Platform Management", href: "/super-admin", badge: "Global" },
                { icon: LayoutDashboard, label: "School Overview", href: "/dashboard" },
            ]
        },
        {
            category: "People & Records",
            icon: Users,
            items: [
                { icon: Users, label: "Student Enrollment", href: "/dashboard/admin/admissions" },
                { icon: Users, label: "Faculty Directory", href: "/dashboard/admin/staff" },
            ]
        },
        {
            category: "Academic Oversight",
            icon: GraduationCap,
            items: [
                { icon: BookOpen, label: "Curriculum Planning", href: "/dashboard/admin/curriculum" },
                { icon: GraduationCap, label: "Result Processor", href: "/dashboard/admin/results/generate" },
            ]
        },
        {
            category: "Financial Suite",
            icon: Landmark,
            items: [
                { icon: NairaIcon, label: "Bursar Hub", href: "/dashboard/bursar" },
                { icon: CreditCard, label: "Revenue & Collections", href: "/dashboard/bursar/finance/collections" },
            ]
        }
    ]
}

export const ROLE_LABELS: Record<UserRole, string> = {
    admin: "Administrator",
    teacher: "Teacher",
    parent: "Parent",
    student: "Student",
    bursar: "Bursar",
    owner: "Proprietor",
    driver: "Driver",
    staff: "Staff Assistant",
    "super-admin": "System Developer"
}

export const ROLE_BADGES: Record<UserRole, string> = {
    admin: "🛡️",
    teacher: "🎓",
    parent: "👨‍👩‍👧",
    student: "🎒",
    bursar: "💰",
    owner: "👑",
    driver: "🚌",
    staff: "📋",
    "super-admin": "⚡"
}
