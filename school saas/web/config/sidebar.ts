import { LayoutDashboard, CalendarDays, BookOpen, Activity, FileText, MapPin, Users, Settings, GraduationCap, ClipboardCheck, CreditCard, UserCircle, BrainCircuit, MessageSquare, BookCheck as BookOpenCheck, Banknote, Wallet, ShieldCheck, Smartphone, Sparkles, Crown, Bus, Bed, Package, Search, Building2, Landmark, Truck, Shield } from "lucide-react"
import { NairaIcon } from "@/components/ui/naira-icon"

export type UserRole = 'admin' | 'teacher' | 'parent' | 'student' | 'bursar'

export type SidebarItem = {
    icon: any
    label: string
    href: string
    disabled?: boolean
    badge?: string
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
            icon: Building2,
            items: [
                { icon: LayoutDashboard, label: "Overview", href: "/dashboard" },
                { icon: Crown, label: "Executive View", href: "/dashboard/admin/executive/mobile" },
                { icon: Users, label: "Student Enrollment", href: "/dashboard/admin/admissions" },
                { icon: GraduationCap, label: "All Students", href: "/dashboard/admin/students" },
                { icon: Users, label: "Faculty Directory", href: "/dashboard/admin/staff" },
                { icon: ClipboardCheck, label: "Staff Attendance", href: "/dashboard/admin/attendance/staff" },
                { icon: BookOpen, label: "Academic Setup", href: "/dashboard/admin/setup/academic" },
                { icon: ShieldCheck, label: "Academic Approvals", href: "/dashboard/admin/approvals" },
                { icon: GraduationCap, label: "Result Processor", href: "/dashboard/admin/results/generate" },
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
            ]
        },
        {
            category: "Campus Logistics",
            icon: Truck,
            items: [
                { icon: Bus, label: "Transport Hub", href: "/dashboard/admin/logistics" },
                { icon: Bed, label: "Hostel Management", href: "/dashboard/admin/hostels" },
            ]
        },
        {
            category: "Security & Health",
            icon: Shield,
            items: [
                { icon: Activity, label: "System Security", href: "/dashboard/admin/security/audit" },
            ]
        },
        {
            category: "System",
            items: [
                { icon: Settings, label: "School Settings", href: "/dashboard/settings" },
            ]
        }
    ],
    // Keep other roles flat for now, or group them if needed later. 
    // The component will handle both flat headers and grouped categories to avoid breaking other roles.
    bursar: [
        {
            category: "Financial Suite",
            items: [
                { icon: LayoutDashboard, label: "Bursar Hub", href: "/dashboard/bursar" },
                { icon: CreditCard, label: "Revenue & Collections", href: "/dashboard/bursar/finance/collections" },
                { icon: Banknote, label: "Payroll", href: "/dashboard/bursar/finance/payroll" },
                { icon: Wallet, label: "Expenses & P&L", href: "/dashboard/bursar/finance/expenses" },
                { icon: NairaIcon, label: "Financial Config", href: "/dashboard/admin/finance/config" },
                { icon: FileText, label: "Invoices", href: "/dashboard/admin/finance/invoices" },
                { icon: CreditCard, label: "Transactions", href: "/dashboard/admin/finance/transactions" },
            ]
        },
        {
            category: "System",
            items: [
                { icon: Settings, label: "Settings", href: "/dashboard/settings" },
            ]
        }
    ],
    // Teacher etc kept flat for simplicity or grouped as 'General'
    teacher: [
        {
            category: "Teaching",
            items: [
                { icon: LayoutDashboard, label: "Overview", href: "/dashboard" },
                { icon: Users, label: "My Classes", href: "/dashboard/teacher/classes" },
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
    parent: [
        {
            category: "General", items: [
                { icon: UserCircle, label: "Child Profile", href: "/dashboard/profile" },
                { icon: FileText, label: "Result Checker", href: "/dashboard/results" },
                { icon: CreditCard, label: "School Fees", href: "/dashboard/billing" },
                { icon: CalendarDays, label: "School Calendar", href: "/dashboard/calendar" },
                { icon: MapPin, label: "Bus Tracker", href: "/dashboard/bus-tracker", disabled: true, badge: "Premium" },
            ]
        }
    ],
    student: [
        {
            category: "General", items: [
                { icon: LayoutDashboard, label: "Overview", href: "/dashboard" },
                { icon: FileText, label: "My Results", href: "/dashboard/results" },
                { icon: BookOpen, label: "Assignments", href: "/dashboard/assignments" },
            ]
        }
    ]
}

export const ROLE_LABELS: Record<UserRole, string> = {
    admin: "Administrator",
    teacher: "Teacher",
    parent: "Parent",
    student: "Student",
    bursar: "Bursar"
}

export const ROLE_BADGES: Record<UserRole, string> = {
    admin: "🛡️",
    teacher: "🎓",
    parent: "👨‍👩‍👧",
    student: "🎒",
    bursar: "💰"
}
