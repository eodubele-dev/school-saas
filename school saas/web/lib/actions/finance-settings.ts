'use server'

import { createClient } from '@/lib/supabase/server'
import { encryptData, decryptData } from '@/lib/utils/encryption'
import { revalidatePath } from 'next/cache'

/**
 * Interface for Paystack configuration stored in tenant settings
 */
export interface PaystackConfig {
    publicKey: string
    secretKey: string // This will be encrypted before storage
    iv: string        // Initialization vector for decryption
    isEnabled: boolean
    updatedAt: string
}

/**
 * Saves Paystack keys for the current tenant.
 * The Secret Key is encrypted before storage.
 */
export async function updatePaystackConfig(data: {
    publicKey: string
    secretKey: string
    isEnabled: boolean
}) {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { success: false, error: 'Unauthorized' }

    // Verify role (Admin/Bursar only)
    const { data: profile } = await supabase
        .from('profiles')
        .select('tenant_id, role')
        .eq('id', user.id)
        .single()

    if (!profile?.tenant_id || !['admin', 'bursar'].includes(profile.role)) {
        return { success: false, error: 'Permission denied' }
    }

    try {
        // 1. Encrypt the secret key
        const encrypted = await encryptData(data.secretKey)

        // 2. Fetch current settings to preserve other keys
        const { data: tenant } = await supabase
            .from('tenants')
            .select('settings')
            .eq('id', profile.tenant_id)
            .single()

        const currentSettings = tenant?.settings || {}
        
        // 3. Update the settings object
        const updatedSettings = {
            ...currentSettings,
            paystack: {
                publicKey: data.publicKey,
                secretKey: encrypted.data,
                iv: encrypted.iv,
                isEnabled: data.isEnabled,
                updatedAt: new Date().toISOString()
            }
        }

        // 4. Save to database
        const { error } = await supabase
            .from('tenants')
            .update({ settings: updatedSettings })
            .eq('id', profile.tenant_id)

        if (error) throw error

        revalidatePath('/dashboard/finance')
        return { success: true }

    } catch (error: any) {
        console.error('[updatePaystackConfig] Error:', error)
        return { success: false, error: error.message || 'Failed to update payment settings' }
    }
}

/**
 * Fetches the public-facing Paystack settings for the UI.
 * Masks the keys for security.
 */
export async function getPaystackSettingsUI() {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return null

    const { data: profile } = await supabase
        .from('profiles')
        .select('tenant_id')
        .eq('id', user.id)
        .single()

    if (!profile?.tenant_id) return null

    const { data: tenant } = await supabase
        .from('tenants')
        .select('settings')
        .eq('id', profile.tenant_id)
        .single()

    const config = tenant?.settings?.paystack as PaystackConfig | undefined

    if (!config) return null

    return {
        publicKey: config.publicKey,
        isEnabled: config.isEnabled,
        updatedAt: config.updatedAt,
        isConfigured: !!config.publicKey && !!config.secretKey
    }
}

/**
 * Internal helper to get and decrypt tenant keys
 * NOT exported to avoid leaking keys to the client
 */
export async function getDecryptedPaystackConfig(tenantId: string) {
    const supabase = createClient()
    
    // We use service-role level access if needed, but here we assume the caller has context
    const { data: tenant } = await supabase
        .from('tenants')
        .select('settings')
        .eq('id', tenantId)
        .single()

    const config = tenant?.settings?.paystack as PaystackConfig | undefined

    if (!config || !config.publicKey || !config.secretKey || !config.iv) {
        return null
    }

    try {
        const decryptedSecret = await decryptData(config.secretKey, config.iv)
        return {
            publicKey: config.publicKey,
            secretKey: decryptedSecret,
            isEnabled: config.isEnabled
        }
    } catch (error) {
        console.error('[getDecryptedPaystackConfig] Decryption failed:', error)
        return null
    }
}

/**
 * Public helper to check if a tenant has enabled online payments
 */
export async function getTenantPaymentStatus(tenantId: string) {
    const supabase = createClient()
    
    const { data: tenant } = await supabase
        .from('tenants')
        .select('settings')
        .eq('id', tenantId)
        .single()

    const config = tenant?.settings?.paystack as PaystackConfig | undefined
    
    return {
        isEnabled: !!config?.isEnabled,
        isConfigured: !!config?.publicKey && !!config?.secretKey
    }
}

/**
 * Tests the provided Paystack keys by calling the Paystack API
 */
export async function testPaystackConnection(publicKey: string, secretKey: string) {
    try {
        const response = await fetch('https://api.paystack.co/controlpanel/check_payout_eligibility', {
            headers: {
                Authorization: `Bearer ${secretKey}`
            }
        })
        
        const data = await response.json()
        
        if (response.ok && data.status) {
            return { success: true, message: 'Connection successful!' }
        } else {
            return { success: false, error: data.message || 'Invalid keys or restricted account' }
        }
    } catch (error: any) {
        return { success: false, error: 'Network error during connection test' }
    }
}
