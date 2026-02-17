
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function debug() {
    console.log("DEBUG_START");

    // Check one question to see schema
    const { data: questions, error } = await supabase
        .from('cbt_questions')
        .select('*')
        .limit(1);

    if (error) {
        console.error("Error:", error);
    } else if (questions && questions.length > 0) {
        console.log("FULL_OBJECT_START");
        console.log(JSON.stringify(questions[0], null, 2));
        console.log("FULL_OBJECT_END");
    } else {
        console.log("No questions found in table.");
    }

    // Check questions for the latest quiz
    const { data: quiz } = await supabase
        .from('cbt_quizzes')
        .select('id, title')
        .eq('visibility', 'published')
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

    if (quiz) {
        const { data: q, error: qError } = await supabase
            .from('cbt_questions')
            .select('*')
            .eq('quiz_id', quiz.id);

        console.log(`Latest Quiz: ${quiz.title} (${quiz.id}) has ${q ? q.length : 0} questions.`);
        if (qError) console.error("Quiz Q Error:", qError);
    }

    console.log("DEBUG_END");
}

debug();
