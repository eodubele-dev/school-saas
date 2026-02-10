import { getMaintenanceTickets } from "@/lib/actions/hostel"
import { MaintenanceClient } from "./maintenance-client"

export default async function MaintenancePage() {
    const { data: tickets = [] } = await getMaintenanceTickets()

    return <MaintenanceClient initialTickets={tickets} />
}
