import Database from "@tauri-apps/plugin-sql"
import { encryptData, decryptData } from "./encryption"

/**
 * Vault Database Wrapper (Elite Superpower) 🤙🏾🛡️🗄️🏾🇳🇬
 * Manages local persistent storage for EduFlow Platinum.
 */

let db: Database | null = null

export async function initVault() {
    if (db) return db
    
    // Create the executive vault database
    db = await Database.load("sqlite:executive_vault.db")
    
    // Create tables if they don't exist
    await db.execute(`
        CREATE TABLE IF NOT EXISTS records (
            id TEXT PRIMARY KEY,
            area TEXT,
            encrypted_data TEXT,
            iv TEXT,
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
    `)
    
    return db
}

/**
 * Upserts a record into the vault with encryption.
 */
export async function upsertVaultRecord(id: string, area: string, data: any) {
    const database = await initVault()
    const jsonString = JSON.stringify(data)
    const { data: encrypted, iv } = await encryptData(jsonString)
    
    await database.execute(
        `INSERT OR REPLACE INTO records (id, area, encrypted_data, iv, updated_at) 
         VALUES (?, ?, ?, ?, CURRENT_TIMESTAMP)`,
        [id, area, encrypted, iv]
    )
}

/**
 * Retrieves and decrypts a record from the vault.
 */
export async function getVaultRecord<T>(id: string): Promise<T | null> {
    const database = await initVault()
    const results = await database.select<any[]>(
        "SELECT encrypted_data, iv FROM records WHERE id = ?",
        [id]
    )
    
    if (results.length === 0) return null
    
    const { encrypted_data, iv } = results[0]
    const decryptedJson = await decryptData(encrypted_data, iv)
    return JSON.parse(decryptedJson) as T
}

/**
 * Clears the entire vault (Security Wipe).
 */
export async function wipeVault() {
    const database = await initVault()
    await database.execute("DELETE FROM records")
}
