import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { ShieldAlert, UserPlus } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"

export default async function ResultRedirectPage({ params }: { params: { domain: string } }) {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        redirect(`/${params.domain}/login`)
    }

    // 1. Try to find a student linked to this user
    // Scenario A: User is a Student
    // Scenario B: User is a Parent (linked via parent_id or email)
    // For this Platinum Demo, we use the simple assumption: 
    // The user *is* the student or mapped directly to one student in the 'students' table 
    // (This matches the behavior in lib/actions/student-results.ts)

    const { data: student } = await supabase
        .from('students')
        .select('id, admission_number')
        .limit(1)
        .single()

    if (student) {
        // Redirect to Admission Number if available (Cleaner URL)
        // e.g. /parent/results/ADM-2023-001 (Replacing / with - to prevent 404 on single segment route)
        // If not, fallback to UUID
        const identifier = student.admission_number
            ? student.admission_number.replace(/\//g, '-')
            : student.id

        redirect(`/parent/results/${identifier}`)
    }

    // 2. If no student found (e.g. new parent account with no child linked yet)
    // Show a helpful empty state
    return (
        <div className="min-h-screen flex items-center justify-center bg-slate-950 p-4">
            <div className="max-w-md w-full bg-slate-900 border border-white/5 rounded-xl p-8 text-center space-y-6">
                <div className="h-20 w-20 bg-slate-800 rounded-full flex items-center justify-center mx-auto">
                    <ShieldAlert className="h-10 w-10 text-slate-500" />
                </div>

                <div className="space-y-2">
                    <h2 className="text-xl font-bold text-white">No Student Linked</h2>
                    <p className="text-slate-400 text-sm">
                        We couldn&apos;t find an active student profile linked to your account.
                    </p>
                </div>

                <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4 text-left">
                    <h3 className="text-xs font-bold text-blue-400 uppercase mb-1">Troubleshooting</h3>
                    <ul className="text-xs text-slate-400 space-y-2 list-disc pl-4">
                        <li>Ensure you logged in with the email provided during admission.</li>
                        <li>Contact the school administrator to link your child.</li>
                    </ul>
                </div>

                <Link href={`/${params.domain}/dashboard`}>
                    <Button variant="outline" className="w-full border-slate-700 hover:bg-slate-800 text-white">
                        Return to Dashboard
                    </Button>
                </Link>
            </div>
        </div>
    )
}
