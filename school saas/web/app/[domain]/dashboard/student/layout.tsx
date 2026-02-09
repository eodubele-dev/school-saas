import { BadgeCheck } from "@/components/student/rewards/badge-check"

export default function StudentLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <>
            {/* <BadgeCheck /> */}
            {children}
        </>
    )
}
