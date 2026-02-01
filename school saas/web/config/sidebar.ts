import { LayoutDashboard, CalendarDays, BookOpen, Activity, FileText, MapPin, Users, Settings, GraduationCap, ClipboardCheck, CreditCard, UserCircle, BrainCircuit, MessageSquare, BookCheck as BookOpenCheck, Banknote, Wallet, ShieldCheck, Smartphone } from "lucide-react"
import { NairaIcon } from "@/components/ui/naira-icon"

export type UserRole = 'admin' | 'teacher' | 'parent' | 'student' | 'bursar'

export const SIDEBAR_LINKS = {
    admin: [
        { icon: LayoutDashboard, label: "Overview", href: "/dashboard" },
        { icon: NairaIcon, label: "Bursar Hub", href: "/dashboard/bursar" },
        { icon: CreditCard, label: "Revenue & Collections", href: "/dashboard/bursar/finance/collections" },
        { icon: Users, label: "Student Admissions", href: "/dashboard/admin/admissions" },
        { icon: Users, label: "Staff Management", href: "/dashboard/admin/staff" },
        { icon: ClipboardCheck, label: "Staff Attendance", href: "/dashboard/admin/attendance/staff" },
        { icon: BookOpen, label: "Academic Setup", href: "/dashboard/admin/setup" },
        { icon: ShieldCheck, label: "Academic Approvals", href: "/dashboard/admin/approvals" }, // New Link
        { icon: NairaIcon, label: "Financial Config", href: "/dashboard/admin/finance/config" },
        { icon: Settings, label: "School Settings", href: "/dashboard/settings" },
    ],
    bursar: [
        { icon: LayoutDashboard, label: "Bursar Hub", href: "/dashboard/bursar" },
        { icon: CreditCard, label: "Revenue & Collections", href: "/dashboard/bursar/finance/collections" },
        { icon: Banknote, label: "Payroll", href: "/dashboard/bursar/finance/payroll" },
        { icon: Wallet, label: "Expenses & P&L", href: "/dashboard/bursar/finance/expenses" },
        { icon: NairaIcon, label: "Financial Config", href: "/dashboard/admin/finance/config" },
        { icon: FileText, label: "Invoices", href: "/dashboard/admin/finance/invoices" },
        { icon: CreditCard, label: "Transactions", href: "/dashboard/admin/finance/transactions" },
        { icon: Settings, label: "Settings", href: "/dashboard/settings" },
    ],
    teacher: [
        { icon: LayoutDashboard, label: "Overview", href: "/dashboard" },
        { icon: Users, label: "My Classes", href: "/dashboard/teacher/classes" },
        { icon: BookOpenCheck, label: "Assessment Hub", href: "/dashboard/teacher/assessments" },
        { icon: ClipboardCheck, label: "Attendance", href: "/dashboard/attendance" },
        { icon: FileText, label: "Lesson Plans", href: "/dashboard/teacher/lesson-plans" },
        { icon: MessageSquare, label: "Communication Hub", href: "/dashboard/messages" },
        { icon: CalendarDays, label: "Academic Calendar", href: "/dashboard/calendar" },
        { icon: Smartphone, label: "Mobile App View", href: "/mobile/teacher" },
    ],
    parent: [
        { icon: UserCircle, label: "Child Profile", href: "/dashboard/profile" },
        { icon: FileText, label: "Result Checker", href: "/dashboard/results" },
        { icon: CreditCard, label: "School Fees", href: "/dashboard/billing" },
        { icon: CalendarDays, label: "School Calendar", href: "/dashboard/calendar" },
        { icon: MapPin, label: "Bus Tracker", href: "/dashboard/bus-tracker", disabled: true, badge: "Premium" },
    ],
    student: [
        { icon: LayoutDashboard, label: "Overview", href: "/dashboard" },
        { icon: FileText, label: "My Results", href: "/dashboard/results" },
        { icon: BookOpen, label: "Assignments", href: "/dashboard/assignments" },
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
