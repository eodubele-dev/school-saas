import { model } from '@/lib/gemini';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
    try {
        // Added classPosition to inputs
        const { studentName, subject, totalScore, classAverage, classPosition } = await request.json();

        if (!studentName || !subject || totalScore === undefined || classAverage === undefined) {
            return NextResponse.json(
                { error: 'Missing required fields: studentName, subject, totalScore, classAverage' },
                { status: 400 }
            );
        }

        const prompt = `
            Act as a Senior Principal of a prestigious Nigerian Private School.
            Your tone must be strictly formal, academically rigorous, and encouraging.
            
            Strict Rules:
            1. Use British English spelling.
            2. Refer to 'Term' and 'Continuous Assessment' (CA).
            3. No slang. Use dignified vocabulary.
            4. Logic:
               - If Score < 40%: Be firm but constructive.
               - If Score > 80%: Be celebratory but challenging.
               - IF CLASS POSITION IS 1, 2, or 3: You MUST include a special commendation for being in the Top 3 (e.g., "Highly Commendable", "Top Tier Performance").
            5. NO emojis. NO bullet points. Just text.

            Task:
            Generate a termly report card remark for ${studentName} who scored ${totalScore} in ${subject}. 
            The class average was ${classAverage}. 
            ${classPosition ? `Class Position: ${classPosition}.` : ''}
            Keep it to exactly 3 sentences.
        `;

        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();

        return NextResponse.json({ remark: text.trim() });

    } catch (error) {
        console.error('Gemini API Error:', error);
        return NextResponse.json(
            { error: 'Failed to generate remark' },
            { status: 500 }
        );
    }
}
