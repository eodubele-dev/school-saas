export const SITE_CONFIG = {
    name: "Eduflow Synergy Systems",
    shortName: "EduFlow",
    tagline: "The Operating System for Elite Schools",
    hq: {
        address: "5 Emmanuel Odubele Ave., Ikorodu, Lagos.",
        status: "All Systems Operational"
    },
    links: {
        twitter: "https://twitter.com/eduflow",
        linkedin: "https://linkedin.com/company/eduflow",
        github: "https://github.com/eduflow",
        download: {
            windows: "/downloads/win/EduFlow-Setup.exe",
            mac: "/downloads/mac/EduFlow-Installer.dmg"
        }
    },
    support: {
        phone: "08130029819",
        phoneFull: "+2348130029819",
        email: "support@eduflow.ng",
        whatsappMessage: "Hello EduFlow, I'd like to learn more about your school management system and book a demo."
    },
    cookieConsent: {
        expiryDays: 180,
        storageKey: "eduflow_cookie_consent"
    }
} as const
