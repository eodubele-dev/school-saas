"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { ArrowUp } from "lucide-react"

export function ScrollToTop() {
    const [isVisible, setIsVisible] = useState(false)

    useEffect(() => {
        const toggleVisibility = () => {
            if (window.scrollY > 500) {
                setIsVisible(true)
            } else {
                setIsVisible(false)
            }
        }

        window.addEventListener("scroll", toggleVisibility)
        return () => window.removeEventListener("scroll", toggleVisibility)
    }, [])

    const scrollToTop = () => {
        window.scrollTo({
            top: 0,
            behavior: "smooth"
        })
    }

    return (
        <div className="fixed bottom-6 right-6 md:bottom-10 md:right-10 z-[90]">
            <AnimatePresence>
                {isVisible && (
                    <motion.button
                        initial={{ opacity: 0, scale: 0.5, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.5, y: 20 }}
                        whileHover={{ scale: 1.1, y: -5 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={scrollToTop}
                        className="w-14 h-14 rounded-full bg-blue-600 text-white shadow-[0_0_30px_rgba(37,99,235,0.4)] flex items-center justify-center relative group backdrop-blur-md"
                        aria-label="Scroll to Top"
                    >
                        <div className="absolute inset-0 bg-gradient-to-tr from-blue-700 to-cyan-500 opacity-0 group-hover:opacity-100 transition-opacity rounded-full" />
                        <ArrowUp className="w-6 h-6 relative z-10" />
                        
                        {/* Magnetic Pulsing Rings */}
                        <div className="absolute inset-0 rounded-full border border-blue-400 opacity-20 animate-ping" />
                    </motion.button>
                )}
            </AnimatePresence>
        </div>
    )
}
