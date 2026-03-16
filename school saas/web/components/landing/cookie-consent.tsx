"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Info, X, Shield, Settings, Share2, ChevronRight } from "lucide-react"
import { SITE_CONFIG } from "@/lib/constants/site-config"
import { cn } from "@/lib/utils"

type ModalType = 'preferences' | 'privacy' | 'third-party' | null

const MODAL_CONTENT = {
    'preferences': {
        title: 'Cookie Preferences',
        icon: <Settings className="w-5 h-5 text-blue-400" />,
        description: 'Choose how we use cookies to personalize your experience. Essential cookies are required for system integrity and security.',
        items: [
            { label: 'Essential Cookies', desc: 'Secure login, fraud prevention, and system stability.', required: true },
            { label: 'Analytics', desc: 'Help us understand how proprietors use the platform.', required: false }
        ]
    },
    'privacy': {
        title: 'Privacy Statement',
        icon: <Shield className="w-5 h-5 text-emerald-400" />,
        description: 'Your data is protected by institutional-grade encryption. We never sell your personal information to third parties.',
        items: [
            { label: 'Data Encryption', desc: 'AES-256 bit encryption at rest and in transit.', required: true },
            { label: 'Oversight', desc: 'Full forensic logs of all data access and modifications.', required: true }
        ]
    },
    'third-party': {
        title: 'Third-Party Cookies',
        icon: <Share2 className="w-5 h-5 text-purple-400" />,
        description: 'We integrate with world-class providers to ensure seamless institutional operations.',
        items: [
            { label: 'Paystack/Monnify', desc: 'Secure payment rail processing and verification.', required: true },
            { label: 'Cloudflare', desc: 'Edge protection and global CDN performance.', required: true }
        ]
    }
}

export function CookieConsent() {
    const [isVisible, setIsVisible] = useState(false)
    const [activeModal, setActiveModal] = useState<ModalType>(null)
    const [analyticsAccepted, setAnalyticsAccepted] = useState(true)

    useEffect(() => {
        const consentData = localStorage.getItem(SITE_CONFIG.cookieConsent.storageKey)
        if (consentData) {
            try {
                const { timestamp, analytics } = JSON.parse(consentData)
                if (analytics !== undefined) setAnalyticsAccepted(analytics)
                
                const now = Date.now()
                const daysElapsed = (now - timestamp) / (1000 * 60 * 60 * 24)
                
                if (daysElapsed > SITE_CONFIG.cookieConsent.expiryDays) {
                    setIsVisible(true)
                }
            } catch (e) {
                setIsVisible(true)
            }
        } else {
            const timer = setTimeout(() => setIsVisible(true), 1500)
            return () => clearTimeout(timer)
        }
    }, [])

    const handleAccept = () => {
        const timestamp = Date.now()
        localStorage.setItem(SITE_CONFIG.cookieConsent.storageKey, JSON.stringify({ 
            status: "accepted", 
            timestamp,
            analytics: true 
        }))
        setAnalyticsAccepted(true)
        setIsVisible(false)
    }

    const handleReject = () => {
        const timestamp = Date.now()
        localStorage.setItem(SITE_CONFIG.cookieConsent.storageKey, JSON.stringify({ 
            status: "rejected", 
            timestamp,
            analytics: false 
        }))
        setAnalyticsAccepted(false)
        setIsVisible(false)
    }

    const savePreferences = () => {
        localStorage.setItem(SITE_CONFIG.cookieConsent.storageKey, JSON.stringify({ 
            status: "custom", 
            timestamp: Date.now(),
            analytics: analyticsAccepted 
        }))
        setActiveModal(null)
        setIsVisible(false)
    }

    return (
        <>
            <AnimatePresence>
                {isVisible && (
                    <motion.div
                        initial={{ y: 100, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        exit={{ y: 100, opacity: 0 }}
                        className="fixed bottom-0 left-0 right-0 z-[100] p-4 md:p-6"
                    >
                        <div className="max-w-7xl mx-auto rounded-2xl bg-[#0F1115]/80 border border-white/10 shadow-[0_-10px_40px_rgba(0,0,0,0.5)] backdrop-blur-2xl p-6 md:p-8">
                            <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                                <div className="flex items-start gap-4 flex-1">
                                    <div className="p-2 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-400 shrink-0">
                                        <Info className="w-5 h-5" />
                                    </div>
                                    <div className="space-y-2">
                                        <p className="text-sm text-slate-300 leading-relaxed">
                                            We use optional cookies to improve your experience on our website and to display personalized advertising based on your online activity. If you reject optional cookies, only cookies necessary to provide you the services listed above will be used. You may change your selection at any time.
                                        </p>
                                        <div className="flex flex-wrap items-center gap-4 text-xs font-medium">
                                            <button 
                                                onClick={() => setActiveModal('preferences')}
                                                className="text-blue-400 hover:text-blue-300 transition-colors"
                                            >
                                                How to manage cookie preferences
                                            </button>
                                            <div className="w-1 h-1 rounded-full bg-slate-700 hidden sm:block" />
                                            <button 
                                                onClick={() => setActiveModal('privacy')}
                                                className="text-blue-400 hover:text-blue-300 transition-colors"
                                            >
                                                Privacy Statement
                                            </button>
                                            <div className="w-1 h-1 rounded-full bg-slate-700 hidden sm:block" />
                                            <button 
                                                onClick={() => setActiveModal('third-party')}
                                                className="text-blue-400 hover:text-blue-300 transition-colors"
                                            >
                                                Third-Party Cookies
                                            </button>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex items-center gap-3 shrink-0">
                                    <button
                                        onClick={handleAccept}
                                        className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-sm font-bold transition-all hover:scale-[1.02] active:scale-95 shadow-[0_0_20px_rgba(37,99,235,0.3)]"
                                    >
                                        Accept All
                                    </button>
                                    <button
                                        onClick={handleReject}
                                        className="px-6 py-2.5 rounded-xl bg-transparent hover:bg-white/5 text-slate-400 hover:text-foreground text-sm font-bold border border-white/10 transition-all"
                                    >
                                        Reject All
                                    </button>
                                    <button
                                        onClick={() => setActiveModal('preferences')}
                                        className="px-6 py-2.5 rounded-xl bg-transparent hover:bg-white/5 text-slate-400 hover:text-foreground text-sm font-bold border border-white/10 transition-all hidden md:block"
                                    >
                                        Manage
                                    </button>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Info Modal */}
            <AnimatePresence>
                {activeModal && (
                    <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setActiveModal(null)}
                            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                        />
                        <motion.div
                            initial={{ scale: 0.95, opacity: 0, y: 20 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.95, opacity: 0, y: 20 }}
                            className="relative w-full max-w-lg bg-[#0F1115] border border-white/10 rounded-[2rem] shadow-[0_30px_60px_rgba(0,0,0,0.8)] overflow-hidden"
                        >
                            <div className="p-8 space-y-8">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-4">
                                        <div className="p-3 rounded-2xl bg-white/5 border border-white/10">
                                            {MODAL_CONTENT[activeModal].icon}
                                        </div>
                                        <div>
                                            <h3 className="text-xl font-bold text-foreground">
                                                {MODAL_CONTENT[activeModal].title}
                                            </h3>
                                            <p className="text-xs text-slate-500 font-mono tracking-widest uppercase">Institutional Policy</p>
                                        </div>
                                    </div>
                                    <button 
                                        onClick={() => setActiveModal(null)}
                                        className="p-2 hover:bg-white/5 rounded-full text-slate-500 hover:text-foreground transition-colors"
                                    >
                                        <X className="w-5 h-5" />
                                    </button>
                                </div>

                                <p className="text-sm text-slate-400 leading-relaxed">
                                    {MODAL_CONTENT[activeModal].description}
                                </p>

                                <div className="space-y-3">
                                    {MODAL_CONTENT[activeModal].items.map((item, i) => (
                                        <div key={i} className="group p-4 rounded-2xl bg-white/[0.02] border border-white/5 hover:border-white/10 transition-all flex items-center justify-between gap-4">
                                            <div className="space-y-1">
                                                <h4 className="text-sm font-semibold text-slate-200">{item.label}</h4>
                                                <p className="text-xs text-slate-500">{item.desc}</p>
                                            </div>
                                            {item.required ? (
                                                <span className="px-2 py-1 rounded-md bg-white/5 text-[10px] uppercase font-bold text-slate-400 tracking-tighter">Required</span>
                                            ) : (
                                                <button
                                                    onClick={() => setAnalyticsAccepted(!analyticsAccepted)}
                                                    className={cn(
                                                        "w-10 h-5 rounded-full transition-colors flex items-center p-1",
                                                        analyticsAccepted ? "bg-blue-600 justify-end" : "bg-slate-700 justify-start"
                                                    )}
                                                    aria-label={analyticsAccepted ? "Disable Analytics" : "Enable Analytics"}
                                                >
                                                    <motion.div 
                                                        layout
                                                        className="w-3 h-3 rounded-full bg-white shadow-sm"
                                                    />
                                                </button>
                                            )}
                                        </div>
                                    ))}
                                </div>

                                <button
                                    onClick={activeModal === 'preferences' ? savePreferences : () => setActiveModal(null)}
                                    className="w-full py-4 rounded-2xl bg-white text-black font-bold text-sm hover:bg-slate-200 transition-all active:scale-[0.98]"
                                >
                                    {activeModal === 'preferences' ? 'Save & Close' : 'Understood'}
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </>
    )
}
