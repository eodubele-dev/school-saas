'use client'

import { motion, AnimatePresence } from 'framer-motion'

interface ProvisioningSuccessProps {
    schoolName: string
    subdomain: string
    isVisible: boolean
}

export function ProvisioningSuccess({ schoolName, subdomain, isVisible }: ProvisioningSuccessProps) {
    return (
        <AnimatePresence>
            {isVisible && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-[#0A0A0B]"
                >
                    {/* Central Radial Glow */}
                    <motion.div
                        initial={{ scale: 0, opacity: 0 }}
                        animate={{
                            scale: [1, 2, 1.5],
                            opacity: [0, 0.6, 0.2]
                        }}
                        transition={{ duration: 2, times: [0, 0.5, 1], ease: "easeOut" }}
                        className="absolute w-[500px] h-[500px] rounded-full bg-cyan-500/30 blur-[120px]"
                    />

                    {/* Success Content */}
                    <motion.div
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 0.5 }}
                        className="relative z-10 text-center space-y-4"
                    >
                        <div className="w-20 h-20 mx-auto rounded-full border-2 border-cyan-400 flex items-center justify-center shadow-[0_0_30px_rgba(34,211,238,0.4)]">
                            <motion.span
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                className="text-3xl"
                            >
                                ✅
                            </motion.span>
                        </div>

                        <h2 className="text-4xl font-bold text-white tracking-tight">
                            {schoolName} is Live
                        </h2>
                        <p className="text-cyan-400 font-mono tracking-widest uppercase text-sm">
                            Partitioning: {subdomain}.eduflow.ng
                        </p>

                        <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: "100%" }}
                            transition={{ delay: 1, duration: 1.5 }}
                            className="h-[1px] bg-gradient-to-r from-transparent via-cyan-400 to-transparent max-w-xs mx-auto mt-8"
                        />

                        <p className="text-gray-500 text-xs mt-4 font-mono animate-pulse">
                            INITIALIZING_PLATINUM_SECURITY_LOGS...
                        </p>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    )
}
