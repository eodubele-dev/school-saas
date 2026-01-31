import { getTeacherClasses } from "@/lib/actions/attendance"
import { getSubjects } from "@/lib/actions/academic"


export default async function GradebookPage() {
    // defaults
    const term = "1st"
    const session = "2023/2024"

    const [classesRes, subjectsRes] = await Promise.all([
        getTeacherClasses(),
        getSubjects()
    ])

    if (!classesRes.success || !subjectsRes.success) {
        return <div>Failed to load data. Please try again.</div>
    }

    const classes = classesRes.data || []
    const subjects = subjectsRes.data || []

    if (classes.length === 0) {
        return <div>No classes found assigned to you.</div>
    }

    return (
        <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
            <div className="flex items-center justify-between space-y-2">
                <h2 className="text-3xl font-bold tracking-tight">Gradebook</h2>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                {/* Filters could go here in future version */}
                <div className="p-4 bg-muted rounded-lg col-span-full">
                    <p className="text-sm font-medium">
                        Current Session: <span className="font-bold">{session}</span> | Term: <span className="font-bold">{term}</span>
                    </p>
                </div>
            </div>

            {/* In a real app, these would be selected via URL params or state. For MVP, using first class/subject or dropdowns inside component. 
                Optimized: We pass lists to client component to handle selection there for interactivity without page reload 
            */}

            <GradebookEntryWrapper
                initialClasses={classes}
                initialSubjects={subjects}
                term={term}
                session={session}
            />
        </div>
    )
}

/* Client wrapper to manage selection state */
import { GradebookEntryWrapper } from "@/components/academic/gradebook-wrapper"
