"use client"

import { isDesktop } from "./desktop"
import { Command } from "@tauri-apps/plugin-shell"
import { writeFile, BaseDirectory } from "@tauri-apps/plugin-fs"

/**
 * Silent Printing Bridge (Platinum Standard)
 * 🤙🏾📠🛡️🏾🇳🇬
 */
export const printDirectly = async (content: string, options: { silent?: boolean, jobName?: string } = {}) => {
  if (!isDesktop()) {
    // Standard Browser Printing
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(content);
      printWindow.document.close();
      printWindow.print();
    }
    return;
  }

  try {
    // 1. Prepare the temporary "Spool" file
    const tempFileName = `spool_${Date.now()}.html`;
    await writeFile(tempFileName, new TextEncoder().encode(content), {
      baseDir: BaseDirectory.Temp,
    });

    // 2. Execute PowerShell Silent Print
    // 'Out-Printer' sends the content directly to the default printer
    const command = Command.create('powershell', [
      '-Command',
      `Get-Content -Path "$env:TEMP\\${tempFileName}" | Out-Printer`
    ]);

    const output = await command.execute();
    
    if (output.code !== 0) {
      throw new Error(`Print failed with code ${output.code}: ${output.stderr}`);
    }

    console.log('Direct Print successful 🤙🏾📠✨');
  } catch (error) {
    console.error('Direct Print Error:', error);
    // Fallback if native fail
    window.print();
  }
};
