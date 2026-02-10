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
        <div className="grid grid-cols-1 xl:grid-cols-[1fr_500px] gap-8 items-start">
            <div className="min-w-0"> {/* Prevent grid blowout */}
                <BrandingForm tenant={tenant} onUpdate={handleUpdate} />
            </div>
            <div className="sticky top-8">
                <ResultPreview data={tenant} />
            </div>
        </div>
    )
}
