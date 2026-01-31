import { LayoutDashboard, CalendarDays, BookOpen, Activity, FileText, MapPin, Users, DollarSign, Settings, GraduationCap, ClipboardCheck, CreditCard, UserCircle } from "lucide-react"

export type UserRole = 'admin' | 'teacher' | 'parent' | 'student'

export const SIDEBAR_LINKS = {
    admin: [
        { icon: LayoutDashboard, label: "Overview", href: "/dashboard" },
        { icon: Users, label: "Student Admissions", href: "/dashboard/admin/admissions" },
        { icon: Users, label: "Staff Management", href: "/dashboard/staff" },
        { icon: BookOpen, label: "Academic Setup", href: "/dashboard/admin/setup" },
        { icon: DollarSign, label: "Financial Config", href: "/dashboard/finance" },
        { icon: Settings, label: "School Settings", href: "/dashboard/settings" },
    ],
    teacher: [
        { icon: LayoutDashboard, label: "Overview", href: "/dashboard" },
        { icon: GraduationCap, label: "My Classes", href: "/dashboard/classes" },
        { icon: ClipboardCheck, label: "Attendance", href: "/dashboard/attendance" },
        { icon: BookOpen, label: "Gradebook", href: "/dashboard/gradebook" },
        { icon: CalendarDays, label: "Lesson Plans", href: "/dashboard/lesson-plans" },
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
    student: "Student"
}

export const ROLE_BADGES: Record<UserRole, string> = {
    admin: "🛡️",
    teacher: "🎓",
    parent: "👨‍👩‍👧",
    student: "🎒"
}
