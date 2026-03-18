import { 
    isPermissionGranted, 
    requestPermission, 
    sendNotification 
} from '@tauri-apps/plugin-notification';
import { toast } from 'sonner';

/**
 * PulseNotifier: High-security utility for native workstation alerts.
 * Bridges the gap between web-standard notifications and Tauri's native system alerts.
 */
export const PulseNotifier = {
    /**
     * Trigger a native notification with a fallback to Sonner toasts.
     */
    async notify(options: { 
        title: string; 
        body: string; 
        icon?: string;
        category?: 'emergency' | 'security' | 'financial' | 'system';
    }) {
        try {
            // Check if we are in a Tauri environment
            const isTauri = typeof window !== 'undefined' && (window as any).__TAURI_INTERNALS__;

            if (isTauri) {
                let hasPermission = await isPermissionGranted();
                
                if (!hasPermission) {
                    const permission = await requestPermission();
                    hasPermission = permission === 'granted';
                }

                if (hasPermission) {
                    sendNotification({
                        title: options.title,
                        body: options.body,
                        // @ts-ignore - Category is platform-specific in some Tauri versions
                        category: options.category
                    });
                    return;
                }
            }

            // Fallback for Web or denied permissions
            toast(options.title, {
                description: options.body,
                style: options.category === 'emergency' || options.category === 'security' 
                    ? { backgroundColor: 'rgb(153, 27, 27)', color: 'white' } 
                    : undefined
            });

        } catch (error) {
            console.error('[PulseNotifier] Alert failure:', error);
            // Final fallback to raw toast
            toast.error(options.title, { description: options.body });
        }
    },

    /**
     * Specifically for Security Violations (Hardware status, unauthorized access)
     */
    async securityAlert(message: string) {
        await this.notify({
            title: "SECURITY VIOLATION 🤙🏾🛡️",
            body: message,
            category: 'security'
        });
    },

    /**
     * Specifically for Financial Transactions (Inbound payments)
     */
    async financialAlert(message: string) {
        await this.notify({
            title: "FINANCIAL PULSE 🤙🏾💰",
            body: message,
            category: 'financial'
        });
    }
};
