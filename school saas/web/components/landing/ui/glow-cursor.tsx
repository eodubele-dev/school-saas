'use client'

import { useEffect, useState } from "react"
import { motion, useSpring, useMotionValue } from "framer-motion"

export function GlowCursor() {
    const mouseX = useMotionValue(0)
    const mouseY = useMotionValue(0)

    const springConfig = { damping: 25, stiffness: 300 }
    const x = useSpring(mouseX, springConfig)
    const y = useSpring(mouseY, springConfig)

    useEffect(() => {
        const moveMouse = (e: MouseEvent) => {
            mouseX.set(e.clientX - 150) // Center offset (300px width / 2)
            mouseY.set(e.clientY - 150)
        }

        window.addEventListener("mousemove", moveMouse)
        return () => window.removeEventListener("mousemove", moveMouse)
    }, [mouseX, mouseY])

    return (
        <motion.div
            className="fixed top-0 left-0 w-[300px] h-[300px] bg-blue-500/15 rounded-full blur-[80px] pointer-events-none z-0 mix-blend-screen hidden lg:block"
            style={{ x, y }}
        />
    )
}
