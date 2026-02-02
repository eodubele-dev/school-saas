import { ShieldAlert } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"

export default function ForbiddenPage() {
    return (
        <div className="h-screen w-full flex flex-col items-center justify-center bg-slate-50 text-slate-900 p-4 text-center">
            <div className="bg-red-100 p-4 rounded-full mb-6 relative">
                <ShieldAlert className="h-12 w-12 text-red-600" />
                <div className="absolute -top-1 -right-1 h-4 w-4 bg-red-600 rounded-full animate-ping" />
            </div>

            <h1 className="text-3xl font-bold tracking-tight mb-2">Access Denied</h1>
            <p className="text-slate-500 max-w-md mb-8">
                Your role does not have permission to view this area.
                This attempt has been logged for security purposes.
            </p>

            <div className="flex gap-4">
                <Button asChild variant="outline">
                    <Link href="/dashboard">Return to Dashboard</Link>
                </Button>
                <Button asChild variant="destructive">
                    <Link href="/login">Switch Account</Link>
                </Button>
            </div>

            <p className="text-xs text-slate-400 mt-12 font-mono">
                Error Code: 403_FORBIDDEN_ZONE
            </p>
        </div>
    )
}
