import { getCurrentWindow, availableMonitors } from "@tauri-apps/api/window"
import { isDesktop } from "./desktop"

/**
 * Native Exam Lockdown Bridge (Platinum Edition)
 * Handles system-level hardware and window restrictions.
 */

export async function enableExamLockdown() {
  if (!isDesktop()) return
  
  const appWindow = getCurrentWindow()
  
  try {
    // 1. Force Fullscreen
    await appWindow.setFullscreen(true)
    
    // 2. Prevent Resizing
    await appWindow.setResizable(false)
    
    // 3. Request Focus & High Priority
    await appWindow.setFocus()
    
    // 4. Always on Top (Extreme Mode)
    await appWindow.setAlwaysOnTop(true)
    
    console.log("Exam Lockdown: Native enforcement active. 🤙🏾🛡️")
  } catch (error) {
    console.error("Exam Lockdown: Failed to apply native constraints.", error)
  }
}

export async function disableExamLockdown() {
  if (!isDesktop()) return
  
  const appWindow = getCurrentWindow()
  
  try {
    await appWindow.setFullscreen(false)
    await appWindow.setResizable(true)
    await appWindow.setAlwaysOnTop(false)
    console.log("Exam Lockdown: Native enforcement released. 🤙🏾🔓")
  } catch (error) {
    console.error("Exam Lockdown: Failed to release native constraints.", error)
  }
}

export async function checkSystemIntegrity() {
  if (!isDesktop()) return { success: true, monitors: 1 }

  try {
    // In Tauri v2, monitors are queried from the window instance
    const monitors = await availableMonitors()
    
    return {
      success: monitors.length === 1,
      monitors: monitors.length,
      warning: monitors.length > 1 ? "MULTIPLE_MONITORS_DETECTED" : null
    }
  } catch (error) {
    console.error("Integrity Check: Failed to query hardware.", error)
    return { success: false, error }
  }
}
