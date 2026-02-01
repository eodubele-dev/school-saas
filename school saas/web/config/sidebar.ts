import { LayoutDashboard, CalendarDays, BookOpen, Activity, FileText, MapPin, Users, Settings, GraduationCap, ClipboardCheck, CreditCard, UserCircle, BrainCircuit, MessageSquare, BookCheck as BookOpenCheck } from "lucide-react"
import { NairaIcon } from "@/components/ui/naira-icon"

export type UserRole = 'admin' | 'teacher' | 'parent' | 'student' | 'bursar'

export const SIDEBAR_LINKS = {
    admin: [
        { icon: LayoutDashboard, label: "Overview", href: "/dashboard" },
        { icon: NairaIcon, label: "Bursar Hub", href: "/dashboard/bursar" },
        { icon: CreditCard, label: "Revenue & Collections", href: "/dashboard/bursar/finance/collections" },
        { icon: Users, label: "Student Admissions", href: "/dashboard/admin/admissions" },
        { icon: Users, label: "Staff Management", href: "/dashboard/admin/staff" },
        { icon: BookOpen, label: "Academic Setup", href: "/dashboard/admin/setup" },
        { icon: NairaIcon, label: "Financial Config", href: "/dashboard/admin/finance/config" },
        { icon: Settings, label: "School Settings", href: "/dashboard/settings" },
    ],
    bursar: [
        { icon: LayoutDashboard, label: "Bursar Hub", href: "/dashboard/bursar" },
        { icon: CreditCard, label: "Revenue & Collections", href: "/dashboard/bursar/finance/collections" },
        { icon: NairaIcon, label: "Financial Config", href: "/dashboard/admin/finance/config" },
        { icon: FileText, label: "Invoices", href: "/dashboard/admin/finance/invoices" },
        { icon: CreditCard, label: "Transactions", href: "/dashboard/admin/finance/transactions" },
        { icon: Settings, label: "Settings", href: "/dashboard/settings" },
    ],
    teacher: [
        { icon: LayoutDashboard, label: "Overview", href: "/dashboard" },
        { icon: Users, label: "My Classes", href: "/dashboard/classes" },
        { icon: ClipboardCheck, label: "Attendance", href: "/dashboard/attendance" },
        { icon: BookOpenCheck, label: "Gradebook", href: "/dashboard/gradebook" },
        { icon: FileText, label: "Lesson Plans", href: "/dashboard/lesson-plans" },
        { icon: BrainCircuit, label: "CBT & Assessments", href: "/dashboard/assessments" },
        { icon: MessageSquare, label: "Communication Hub", href: "/dashboard/messages" },
        { icon: CalendarDays, label: "Academic Calendar", href: "/dashboard/calendar" },
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
