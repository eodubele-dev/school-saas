import { getHostelsWithStats } from "@/lib/actions/hostel"
import { ConfigClient } from "./config-client"

export default async function HostelConfigPage() {
    const { data: buildings = [] } = await getHostelsWithStats()

    return <ConfigClient initialBuildings={buildings} />
}
