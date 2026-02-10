import { getHostelsWithStats } from "@/lib/actions/hostel"
import { NightCheckClient } from "./night-check-client"

export default async function NightCheckPage() {
    const { data: buildings = [] } = await getHostelsWithStats()

    return <NightCheckClient initialBuildings={buildings} />
}
