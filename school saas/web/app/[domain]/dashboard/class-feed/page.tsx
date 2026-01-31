import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { getTeacherClasses } from "@/lib/actions/attendance"
import { ClassFeedManager } from "@/components/class-feed/class-feed-manager"

export default async function ClassFeedPage() {
    const supabase = createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
        redirect("/login")
    }

    // Get classes (reusing the helper from attendance.ts)
    const classesResult = await getTeacherClasses()
    const classes = classesResult.data || []

    return (
        <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
            <div className="flex items-center justify-between space-y-2">
                <h2 className="text-3xl font-bold tracking-tight">Digital Diary</h2>
                <p className="text-muted-foreground">
                    Share updates and photos with parents
                </p>
            </div>

            {classes.length > 0 ? (
                <ClassFeedManager classes={classes} />
            ) : (
                <div className="flex h-[400px] items-center justify-center rounded-md border border-dashed text-center">
                    <div className="space-y-2">
                        <p className="text-lg font-medium">No classes found</p>
                        <p className="text-sm text-muted-foreground">
                            You haven&apos;t been assigned to any classes yet.
                        </p>
                    </div>
                </div>
            )}
        </div>
    )
}
