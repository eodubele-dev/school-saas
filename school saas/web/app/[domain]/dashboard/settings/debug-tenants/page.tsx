import { createClient } from "@/lib/supabase/server"

export default async function DebugTenantsPage() {
    const supabase = createClient()

    // Check staff_attendance columns
    const { data: attendanceSample, error: attendanceError } = await supabase
        .from('staff_attendance')
        .select('id, latitude, longitude, distance_meters, location_verified')
        .limit(1)

    return (
        <div className="p-8 bg-black text-white font-mono text-sm whitespace-pre-wrap">
            <h1>Schema Debug</h1>
            <section className="mb-8">
                <h2>Staff Attendance Columns Check</h2>
                {attendanceError ? (
                    <div className="text-red-500">
                        Error: {attendanceError.message}
                        <br />
                        (This likely means the columns latitude, longitude, etc. do not exist)
                    </div>
                ) : (
                    <div className="text-green-500">
                        Columns exist!
                        <br />
                        Sample: {JSON.stringify(attendanceSample, null, 2)}
                    </div>
                )}
            </section>
        </div>
    )
}
