import { redirect } from "next/navigation"

export default function StaffPage({ params }: { params: { domain: string } }) {
    redirect(`/${params.domain}/dashboard/admin/staff`)
}
