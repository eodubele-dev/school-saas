import { getDailyManifest, startTrip } from "@/lib/actions/logistics"
import { ManifestClient } from "@/components/logistics/manifest-client"
import { notFound } from "next/navigation"

export default async function ManifestPage({
    params,
    searchParams
}: {
    params: { domain: string, routeId: string },
    searchParams: { dir?: string }
}) {
    const direction = (searchParams.dir === 'dropoff' ? 'dropoff' : 'pickup')
    const manifest = await getDailyManifest(params.routeId, direction)

    if (!manifest) {
        return <div className="p-8 text-white">Route not initialized or empty assignments.</div>
    }

    return (
        <div className="min-h-screen bg-slate-950 text-white max-w-md mx-auto border-x border-white/5 pb-20">
            {/* Header */}
            <div className="bg-slate-900 border-b border-white/10 p-4 sticky top-0 z-10 glass-header">
                <div className="flex justify-between items-center">
                    <div>
                        <h2 className="font-bold text-lg">Route Manifest</h2>
                        <p className="text-xs text-slate-400 capitalize">{direction} • {new Date().toLocaleDateString()}</p>
                    </div>
                    <div className="px-2 py-1 bg-cyan-500/20 text-cyan-400 text-xs font-bold rounded">
                        {manifest.status.toUpperCase()}
                    </div>
                </div>
            </div>

            {/* Client Interactions */}
            <ManifestClient manifest={manifest} />
        </div>
    )
}
