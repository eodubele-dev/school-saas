/**
 * Encryption Utility (Elite Superpower) 🤙🏾🛡️🔐🏾🇳🇬
 * Handles AES-256-GCM encryption for local records.
 */

// We'll use a consistent machine-basis for the key (usually stored in hardware)
// For this implementation, we derive it from a unique app identifier.
const VAULT_KEY_BASIS = "EDÜFLÖW_PLATINÜM_VAÜLT_2026_🇳🇬"

/**
 * Derives a cryptographic key from the basis string.
 */
async function getEncryptionKey() {
    const enc = new TextEncoder()
    const keyData = enc.encode(VAULT_KEY_BASIS)
    const hash = await crypto.subtle.digest('SHA-256', keyData)
    return await crypto.subtle.importKey(
        'raw',
        hash,
        'AES-GCM',
        false,
        ['encrypt', 'decrypt']
    )
}

/**
 * Encrypts a string using AES-256-GCM.
 */
export async function encryptData(text: string): Promise<{ data: string; iv: string }> {
    const key = await getEncryptionKey()
    const iv = crypto.getRandomValues(new Uint8Array(12))
    const enc = new TextEncoder()
    const encoded = enc.encode(text)

    const encrypted = await crypto.subtle.encrypt(
        { name: 'AES-GCM', iv },
        key,
        encoded
    )
    const encryptedArray = new Uint8Array(encrypted)
    let binaryData = ''
    for (let i = 0; i < encryptedArray.byteLength; i++) {
        binaryData += String.fromCharCode(encryptedArray[i])
    }

    let binaryIv = ''
    for (let i = 0; i < iv.byteLength; i++) {
        binaryIv += String.fromCharCode(iv[i])
    }

    return {
        data: btoa(binaryData),
        iv: btoa(binaryIv)
    }
}

/**
 * Decrypts a string using AES-256-GCM.
 */
export async function decryptData(encryptedBase64: string, ivBase64: string): Promise<string> {
    const key = await getEncryptionKey()
    const binaryIv = atob(ivBase64)
    const iv = new Uint8Array(binaryIv.length)
    for (let i = 0; i < binaryIv.length; i++) {
        iv[i] = binaryIv.charCodeAt(i)
    }

    const binaryEnc = atob(encryptedBase64)
    const encrypted = new Uint8Array(binaryEnc.length)
    for (let i = 0; i < binaryEnc.length; i++) {
        encrypted[i] = binaryEnc.charCodeAt(i)
    }

    const decrypted = await crypto.subtle.decrypt(
        { name: 'AES-GCM', iv },
        key,
        encrypted
    )

    return new TextDecoder().decode(decrypted)
}
