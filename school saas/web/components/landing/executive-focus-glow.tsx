'use client'

import { useExecutiveConversion } from "./executive-context"
import { motion, AnimatePresence } from "framer-motion"

export function ExecutiveFocusGlow() {
    const { isPhysicalDemoOpen } = useExecutiveConversion()

    return (
        <AnimatePresence>
            {isPhysicalDemoOpen && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.8 }}
                    className="fixed inset-0 z-[40] pointer-events-none overflow-hidden"
                >
                    {/* THE 'DEEP BLUE' GLOBAL FOCUS GLOW */}
                    <div className="absolute inset-0 bg-[#000000]" />
                    <motion.div
                        animate={{
                            scale: [1, 1.1, 1],
                            opacity: [0.3, 0.5, 0.3]
                        }}
                        transition={{
                            duration: 4,
                            repeat: Infinity,
                            ease: "easeInOut"
                        }}
                        className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(30,58,138,0.6)_0%,transparent_70%)] mix-blend-screen"
                    />
                    <div className="absolute inset-0 bg-blue-900/10 backdrop-blur-[4px]" />
                </motion.div>
            )}
        </AnimatePresence>
    )
}
