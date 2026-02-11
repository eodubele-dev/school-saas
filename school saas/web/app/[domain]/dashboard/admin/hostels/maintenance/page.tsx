import { getMaintenanceTickets } from "@/lib/actions/hostel"
import { getStaffList } from "@/lib/actions/staff"
import { MaintenanceClient } from "./maintenance-client"

export const dynamic = 'force-dynamic'

export default async function MaintenancePage() {
    const { data: tickets = [] } = await getMaintenanceTickets()

    // In a real app we'd get the domain from session/params
    // For now we just need a generic staff list for the tenant
    const { data: staff = [] } = await getStaffList("", 1)

    return <MaintenanceClient initialTickets={tickets} staffList={staff} />
}
