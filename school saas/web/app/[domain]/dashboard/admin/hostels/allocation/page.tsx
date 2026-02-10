import { getHostelsWithStats } from "@/lib/actions/hostel"
import { AllocationClient } from "./allocation-client"

export default async function AllocationPage() {
    const { data: buildings = [], error } = await getHostelsWithStats()

    if (error) {
        return (
            <div className="p-8 text-center bg-red-500/10 border border-red-500/20 rounded-xl">
                <p className="text-red-400 font-bold">Error loading hostels: {error}</p>
            </div>
        )
    }

    return <AllocationClient initialBuildings={buildings} />
}
