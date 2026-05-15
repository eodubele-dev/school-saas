"use client"

import { useEffect } from "react"
import { isDesktop } from "@/lib/utils/desktop"
import { getAdminStats } from "@/lib/actions/dashboard"
import { TrayIcon } from "@tauri-apps/api/tray"
import { Menu } from "@tauri-apps/api/menu"
import { getCurrentWindow } from "@tauri-apps/api/window"

/**
 * Tray Ticker Command Center (Platinum Edition) 🤙🏾📈🏾🇳🇬
 * Displays live school pulse directly in the OS system tray.
 */

export function TrayTicker() {
    useEffect(() => {
        if (!isDesktop()) return

        let pollInterval: any
        let tray: TrayIcon | null = null

        const setupTray = async () => {
            try {
                // 1. Initial Data Fetch
                const stats = await getAdminStats()
                const revenue = stats?.totalRevenue?.toLocaleString('en-NG', { style: 'currency', currency: 'NGN' }) || "₦0.00"
                const activeStudents = stats?.totalStudents || 0

                // 2. Create the Menu
                const menu = await Menu.new({
                  items: [
                    { id: 'title', text: 'EduFlow Platinum Command', enabled: false },
                    { id: 'sep1', item: 'Separator' },
                    { id: 'students', text: `Students: ${activeStudents} Active` },
                    { id: 'revenue', text: `Revenue: ${revenue}` },
                    { id: 'sep2', item: 'Separator' },
                    { id: 'show', text: 'Show Command Center' }
                  ]
                })

                // 3. Initialize/Update Tray
                if (!tray) {
                    tray = await (TrayIcon as any).new({
                        id: 'eduflow-tray',
                        menu,
                        menuOnLeftClick: false,
                        action: (event: any) => {
                            // On click, restore and focus the main window
                            if (event.type === 'Click' && event.button === 'Left') {
                                getCurrentWindow().show()
                                getCurrentWindow().setFocus()
                            }
                        }
                    })

                    // Handle Menu Events
                    (menu as any).onMenuEvent(async (id: string) => {
                        if (id === 'show') {
                            const win = getCurrentWindow()
                            await win.show()
                            await win.setFocus()
                        }
                    })
                } else {
                    await tray.setMenu(menu)
                }

                console.log("Tray Ticker: Remote pulse synchronized. 🤙🏾📡")
            } catch (error) {
                console.error("Tray Ticker Error:", error)
            }
        }

        setupTray()

        // Sync every 15 minutes
        pollInterval = setInterval(setupTray, 15 * 60 * 1000)

        return () => {
            if (pollInterval) clearInterval(pollInterval)
        }
    }, [])

    return null
}
