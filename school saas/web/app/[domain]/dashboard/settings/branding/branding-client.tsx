"use client"

import { useState } from "react"
import { BrandingForm } from "./branding-form"
import { ResultPreview } from "./result-preview"

export function BrandingClient({ initialTenant }: { initialTenant: any }) {
    const [tenant, setTenant] = useState(initialTenant)

    const handleUpdate = (updates: any) => {
        setTenant((prev: any) => ({ ...prev, ...updates }))
    }

    return (
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-12 items-start">
            <BrandingForm tenant={tenant} onUpdate={handleUpdate} />
            <ResultPreview data={tenant} />
        </div>
    )
}
