"use client"

import { save } from "@tauri-apps/plugin-dialog";
import { writeFile } from "@tauri-apps/plugin-fs";
import { isDesktop } from "./desktop";
import { toast } from "sonner";

/**
 * Saves a file to the native filesystem using Tauri plugins.
 * Falls back to browser download if not on desktop.
 */
export async function saveFileNative(data: Uint8Array, filename: string, extension: string = 'pdf') {
    if (!isDesktop()) {
        // Browser fallback
        const blob = new Blob([data as any], { type: 'application/pdf' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename.endsWith(`.${extension}`) ? filename : `${filename}.${extension}`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        return;
    }

    try {
        const filePath = await save({
            filters: [{
                name: extension.toUpperCase(),
                extensions: [extension]
            }],
            defaultPath: filename.endsWith(`.${extension}`) ? filename : `${filename}.${extension}`
        });

        if (filePath) {
            await writeFile(filePath, data);
            toast.success(`Report saved successfully to ${filePath} 🤙🏾📂`);
        }
    } catch (error) {
        console.error("Failed to save native file:", error);
        toast.error("Failed to save report to disk.");
        
        // Final fallback to browser-style download even in Tauri if FS fails
        const blob = new Blob([data as any], { type: 'application/pdf' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        a.click();
    }
}
