import { redirect } from "next/navigation"

export default function AdminCurriculumPage() {
    // This feature has been moved to the Teacher portal only
    redirect('/dashboard')
}
