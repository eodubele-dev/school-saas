import { getInventoryItems } from "@/lib/actions/hostel"
import { InventoryClient } from "./inventory-client"

export default async function InventoryPage() {
    const { data: items = [] } = await getInventoryItems()

    return <InventoryClient initialItems={items} />
}
