import { LayoutDashboard, CalendarDays, BookOpen, Activity, FileText, MapPin, Users, DollarSign, Settings, GraduationCap, ClipboardCheck, CreditCard, UserCircle } from "lucide-react"

export type UserRole = 'admin' | 'teacher' | 'parent' | 'student'

export const SIDEBAR_LINKS = {
    admin: [
        { icon: LayoutDashboard, label: "Overview", href: "/" },
        { icon: Users, label: "Staff Management", href: "/staff" },
        { icon: FileText, label: "Academic Reports", href: "/reports/academic" },
        { icon: DollarSign, label: "Financial Reports", href: "/reports/financial" },
        { icon: Settings, label: "School Settings", href: "/settings" },
    ],
    teacher: [
        { icon: LayoutDashboard, label: "Overview", href: "/" },
        { icon: GraduationCap, label: "My Classes", href: "/classes" },
        { icon: ClipboardCheck, label: "Attendance", href: "/attendance" },
        { icon: BookOpen, label: "Gradebook", href: "/gradebook" },
        { icon: CalendarDays, label: "Lesson Plans", href: "/lesson-plans" },
    ],
    parent: [
        { icon: LayoutDashboard, label: "Overview", href: "/" },
        { icon: UserCircle, label: "Child Profile", href: "/children" },
        { icon: FileText, label: "Result Checker", href: "/results" },
        { icon: CreditCard, label: "Fee Payment", href: "/fees" },
        { icon: CalendarDays, label: "School Calendar", href: "/calendar" },
    ],
    student: [
        { icon: LayoutDashboard, label: "Overview", href: "/" },
        { icon: FileText, label: "My Results", href: "/results" },
        { icon: BookOpen, label: "Assignments", href: "/assignments" },
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
