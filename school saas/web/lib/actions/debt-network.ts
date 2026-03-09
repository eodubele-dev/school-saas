'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';

export async function flagParentAsDebtor(
    phone: string,
    email: string,
    studentName: string,
    parentName: string,
    amountTier: 'low' | 'medium' | 'high'
) {
    const supabase = createClient();

    // Create consistent fuzzy hashes for lookup (lowercase, remove spaces and special characters)
    const normalize = (str: string) => str ? str.toLowerCase().replace(/[^a-z0-9]/g, '') : null;

    const phoneHash = normalize(phone);
    const emailHash = normalize(email);
    const studentFuzzy = normalize(studentName);
    const parentFuzzy = normalize(parentName);

    try {
        const { data, error } = await supabase.rpc('flag_debtor', {
            p_format_phone_hash: phoneHash,
            p_format_email_hash: emailHash,
            p_student_name_fuzzy: studentFuzzy,
            p_parent_name_fuzzy: parentFuzzy,
            p_amount_tier: amountTier
        });

        if (error) {
            console.error("RPC Error (flag_debtor):", error);
            throw new Error(error.message);
        }

        revalidatePath('/dashboard/bursar/debt-network');
        return { success: true, id: data };
    } catch (err: any) {
        return { success: false, error: err.message || "Failed to flag debtor." };
    }
}

export async function verifyAdmissionClearance(
    phone: string,
    email: string,
    studentName: string,
    parentName: string
) {
    const supabase = createClient();

    const normalize = (str: string) => str ? str.toLowerCase().replace(/[^a-z0-9]/g, '') : null;

    const phoneHash = normalize(phone);
    const emailHash = normalize(email);
    const studentFuzzy = normalize(studentName);
    const parentFuzzy = normalize(parentName);

    try {
        const { data, error } = await supabase.rpc('check_debt_status', {
            p_phone_hash: phoneHash,
            p_email_hash: emailHash,
            p_student_fuzzy: studentFuzzy,
            p_parent_fuzzy: parentFuzzy
        });

        if (error) {
            console.error("RPC Error (check_debt_status):", error);
            // Failsafe: if the network check fails, we allow admission but log it. We shouldn't block the school if our server blips.
            return { success: true, warning: false, data: { has_debt: false } };
        }

        return {
            success: true,
            warning: data.has_debt,
            data: data
        };
    } catch (err: any) {
        console.error("Clearance Network Error:", err);
        return { success: true, warning: false, data: { has_debt: false } };
    }
}

export async function resolveDebtFlag(flagId: string) {
    const supabase = createClient();

    try {
        const { data, error } = await supabase.rpc('resolve_debt_flag', {
            p_flag_id: flagId
        });

        if (error) throw new Error(error.message);

        revalidatePath('/dashboard/bursar/debt-network');
        return { success: true };
    } catch (err: any) {
        return { success: false, error: err.message || "Failed to resolve debt." };
    }
}
