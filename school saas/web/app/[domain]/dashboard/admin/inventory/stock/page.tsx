import { getInventoryItems, getInventoryCategories, getInventoryVendors } from "@/lib/actions/inventory"
import { StockManager } from "@/components/inventory/stock-manager"

export default async function StockPage() {
    const [itemsRes, catsRes, vendorsRes] = await Promise.all([
        getInventoryItems(),
        getInventoryCategories(),
        getInventoryVendors()
    ])

    return (
        <StockManager
            initialItems={itemsRes.success ? itemsRes.data : []}
            categories={catsRes.success ? catsRes.data : []}
            vendors={vendorsRes.success ? vendorsRes.data : []}
        />
    )
}
