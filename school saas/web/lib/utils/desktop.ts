"use client"

/**
 * Utility to detect if the application is running inside a Tauri (desktop) container.
 */
export const isDesktop = (): boolean => {
  if (typeof window === "undefined") return false;
  
  // Tauri injected window object check
  // In Tauri v2, it usually injects __TAURI_INTERNALS__ or specific API flags
  return !!(window as any).__TAURI_INTERNALS__ || !!(window as any).__TAURI__;
};
