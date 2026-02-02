import { School } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"

export default function NotFoundPage() {
    return (
        <div className="h-screen w-full flex flex-col items-center justify-center bg-slate-50 text-slate-900 p-4 text-center">
            <div className="bg-blue-100 p-4 rounded-full mb-6">
                <School className="h-12 w-12 text-blue-600" />
            </div>

            <h1 className="text-3xl font-bold tracking-tight mb-2">School Not Found</h1>
            <p className="text-slate-500 max-w-md mb-8">
                We couldn't find a school with this specific web address.
                Please check the URL or contact the school administrator.
            </p>

            <Button asChild>
                <Link href="https://eduflow.ng">Go to EduFlow Home</Link>
            </Button>
        </div>
    )
}
