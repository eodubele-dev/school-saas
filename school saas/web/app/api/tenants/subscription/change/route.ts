import { NextRequest, NextResponse } from "next/server"
import { changeSubscriptionTier } from "@/lib/actions/subscription"

export async function PATCH(req: NextRequest) {
    try {
        const body = await req.json()
        const { targetTierId } = body

        if (!targetTierId) {
            return NextResponse.json({ success: false, error: "targetTierId is required" }, { status: 400 })
        }

        const result = await changeSubscriptionTier(targetTierId)

        if (!result.success) {
            return NextResponse.json(result, { status: 403 })
        }

        return NextResponse.json(result)
    } catch (error: any) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 })
    }
}
