import { getInventoryVendors } from "@/lib/actions/inventory"
import { VendorManager } from "@/components/inventory/vendor-manager"

export default async function VendorsPage() {
    const res = await getInventoryVendors()
    const vendors = res.success ? res.data : []

    return (
        <VendorManager initialVendors={vendors} />
    )
}
