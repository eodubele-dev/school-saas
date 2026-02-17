
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function debug() {
    console.log("--- Debugging Quiz Status Fallback Logic ---");

    // 1. Get the latest attempt to see who "owns" it
    const { data: attempts, error: attError } = await supabase
        .from('cbt_attempts')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(1);

    if (attError || !attempts || attempts.length === 0) {
        console.error("No attempts found or error:", attError);
        return;
    }

    const latestAttempt = attempts[0];
    console.log(`Latest Attempt ID: ${latestAttempt.id}`);
    console.log(`Attempt Student ID: ${latestAttempt.student_id}`);
    console.log(`Attempt Status:    ${latestAttempt.status}`);

    // 2. Simulate the Fallback Logic I added to getUpcomingQuizzes
    console.log("\nRunning Fallback Resolution...");

    const { data: demoStudent } = await supabase
        .from('students')
        .select('id, class_id')
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

    if (!demoStudent) {
        console.log("Fallback found NO student.");
    } else {
        console.log(`Fallback Student ID: ${demoStudent.id}`);

        if (demoStudent.id === latestAttempt.student_id) {
            console.log("\n✅ SUCCESS: Fallback logic resolves to the CORRECT student ID.");
            console.log("This means getUpcomingQuizzes should now find this attempt.");
        } else {
            console.log("\n❌ FAILURE: Fallback logic resolves to A DIFFERENT student ID.");
            console.log("The dashboard will still show 'Not Started' because IDs don't match.");
        }
    }
}

debug();
