// Geolocation Utilities
// Helper functions for GPS calculations and verification

/**
 * Calculate distance between two coordinates using Haversine formula
 * Returns distance in meters
 */
export function calculateDistance(
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number
): number {
    const earthRadiusMeters = 6371000 // Earth's radius in meters

    const toRadians = (degrees: number) => degrees * (Math.PI / 180)

    const dLat = toRadians(lat2 - lat1)
    const dLon = toRadians(lon2 - lon1)

    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(toRadians(lat1)) *
        Math.cos(toRadians(lat2)) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2)

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))

    return earthRadiusMeters * c
}

/**
 * Verify if a location is within the allowed radius
 */
export function isWithinRadius(
    userLat: number,
    userLon: number,
    targetLat: number,
    targetLon: number,
    radiusMeters: number
): { verified: boolean; distance: number } {
    const distance = calculateDistance(userLat, userLon, targetLat, targetLon)
    const verified = distance <= radiusMeters

    return { verified, distance: Math.round(distance * 100) / 100 }
}

/**
 * Validate GPS coordinates
 */
export function isValidCoordinates(lat: number, lon: number): boolean {
    return (
        typeof lat === 'number' &&
        typeof lon === 'number' &&
        lat >= -90 &&
        lat <= 90 &&
        lon >= -180 &&
        lon <= 180 &&
        !isNaN(lat) &&
        !isNaN(lon)
    )
}

/**
 * Format distance for display
 */
export function formatDistance(meters: number): string {
    if (meters < 1000) {
        return `${Math.round(meters)}m`
    }
    return `${(meters / 1000).toFixed(2)}km`
}

/**
 * Get user's current position (browser API)
 * This is a client-side only function
 */
export function getCurrentPosition(): Promise<GeolocationPosition> {
    return new Promise((resolve, reject) => {
        if (!navigator.geolocation) {
            reject(new Error('Geolocation is not supported by this browser'))
            return
        }

        navigator.geolocation.getCurrentPosition(
            resolve,
            reject,
            {
                enableHighAccuracy: true,
                timeout: 10000,
                maximumAge: 0
            }
        )
    })
}

/**
 * Watch user's position (continuous tracking)
 * Returns a watch ID that can be used to clear the watch
 */
export function watchPosition(
    onSuccess: (position: GeolocationPosition) => void,
    onError: (error: GeolocationPositionError) => void
): number {
    if (!navigator.geolocation) {
        throw new Error('Geolocation is not supported by this browser')
    }

    return navigator.geolocation.watchPosition(
        onSuccess,
        onError,
        {
            enableHighAccuracy: true,
            timeout: 10000,
            maximumAge: 0
        }
    )
}

/**
 * Clear position watch
 */
export function clearWatch(watchId: number): void {
    if (navigator.geolocation) {
        navigator.geolocation.clearWatch(watchId)
    }
}

/**
 * Check if geolocation permission is granted
 */
export async function checkGeolocationPermission(): Promise<'granted' | 'denied' | 'prompt'> {
    if (!navigator.permissions) {
        return 'prompt'
    }

    try {
        const result = await navigator.permissions.query({ name: 'geolocation' })
        return result.state
    } catch (error) {
        console.error('Error checking geolocation permission:', error)
        return 'prompt'
    }
}

/**
 * Request geolocation permission
 */
export async function requestGeolocationPermission(): Promise<boolean> {
    try {
        await getCurrentPosition()
        return true
    } catch (error) {
        console.error('Geolocation permission denied:', error)
        return false
    }
}
