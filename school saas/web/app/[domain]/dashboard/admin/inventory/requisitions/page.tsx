
import { getRequisitions } from "@/lib/actions/inventory"
import { RequisitionManager } from "@/components/inventory/requisition-manager"

export default async function RequisitionsPage() {
    const res = await getRequisitions()
    const requests = res.success ? res.data : []

    return (
        <RequisitionManager initialRequests={requests} />
    )
}
