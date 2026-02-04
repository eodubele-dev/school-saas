"use client"

import { useEffect, useState } from 'react'
import Joyride, { CallBackProps, STATUS, Step, Styles } from 'react-joyride'
import confetti from 'canvas-confetti'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'

export function ExecutiveTour({ enabled = true }: { enabled?: boolean }) {
    const [run, setRun] = useState(false)
    const [mounted, setMounted] = useState(false)
    const supabase = createClient()
    const router = useRouter()

    useEffect(() => {
        setMounted(true)
    }, [])

    useEffect(() => {
        // Check first_login status
        async function checkTourStatus() {
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) return

            // We fetch specific column. If column doesn't exist, this might error or return null.
            // Assumption: migration ran or we handle it.
            const { data: profile } = await supabase
                .from('profiles')
                .select('first_login')
                .eq('id', user.id)
                .single()

            if (profile?.first_login) {
                // Short delay to ensure DOM is ready
                setTimeout(() => setRun(true), 1000)
            }
        }

        if (enabled) checkTourStatus()
    }, [enabled])

    const handleJoyrideCallback = async (data: CallBackProps) => {
        const { status, type } = data
        const finishedStatuses: string[] = [STATUS.FINISHED, STATUS.SKIPPED]

        if (finishedStatuses.includes(status)) {
            setRun(false)

            // Mark as seen in DB
            const { data: { user } } = await supabase.auth.getUser()
            if (user) {
                await supabase.from('profiles').update({ first_login: false }).eq('id', user.id)
            }

            if (status === STATUS.FINISHED) {
                triggerCelebration()
                toast.success("You are ready to lead! 🚀")
            }
        }
    }

    const triggerCelebration = () => {
        const duration = 3 * 1000
        const animationEnd = Date.now() + duration
        const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 0 }

        const randomInRange = (min: number, max: number) => Math.random() * (max - min) + min

        const interval: any = setInterval(function () {
            const timeLeft = animationEnd - Date.now()

            if (timeLeft <= 0) {
                return clearInterval(interval)
            }

            const particleCount = 50 * (timeLeft / duration)
            confetti({ ...defaults, particleCount, origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 } })
            confetti({ ...defaults, particleCount, origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 } })
        }, 250)
    }

    const steps: Step[] = [
        {
            target: 'body',
            placement: 'center',
            content: (
                <div className="text-center">
                    <h3 className="text-xl font-bold text-[var(--school-accent)] mb-2">Welcome, Principal!</h3>
                    <p className="text-slate-300">Let's take a 60-second tour of your new digital command center.</p>
                </div>
            ),
            disableBeacon: true,
        },
        {
            target: '#revenue-card',
            content: (
                <div>
                    <h4 className="font-bold text-white mb-1">The Financial Pulse</h4>
                    <p className="text-sm text-slate-300">Your school's heartbeat. See real-time fee collections and projected revenue at a glance.</p>
                </div>
            ),
        },
        {
            target: '#sidebar-audit',
            content: (
                <div>
                    <h4 className="font-bold text-white mb-1">Integrity Guard</h4>
                    <p className="text-sm text-slate-300">Total Transparency. Every grade change and deleted invoice is logged here. Your data is immutable.</p>
                </div>
            ),
            placement: 'right'
        },
        {
            target: '#staff-attendance-gauge',
            content: (
                <div>
                    <h4 className="font-bold text-white mb-1">Staff Presence</h4>
                    <p className="text-sm text-slate-300">Who is in class? Monitor teacher attendance and clock-ins in real-time from your office.</p>
                </div>
            ),
        },
        {
            target: '#nudge-debtors-btn',
            content: (
                <div>
                    <h4 className="font-bold text-white mb-1">Recover Fees Faster</h4>
                    <p className="text-sm text-slate-300">One tap sends a professional SMS reminder to all parents with outstanding balances.</p>
                </div>
            ),
        }
    ]

    const customStyles: Styles = {
        options: {
            arrowColor: '#0f172a', // slate-900
            backgroundColor: '#0f172a',
            overlayColor: 'rgba(0, 0, 0, 0.6)',
            primaryColor: '#06b6d4', // cyan-500
            textColor: '#fff',
            zIndex: 1000,
        },
        tooltip: {
            borderRadius: '12px',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            boxShadow: '0 0 20px rgba(6, 182, 212, 0.2)', // cyan glow
            padding: '16px',
        },
        buttonNext: {
            backgroundColor: 'var(--school-accent)',
            fontSize: '12px',
            fontWeight: 600,
            padding: '8px 16px',
            borderRadius: '6px',
        },
        buttonBack: {
            color: '#94a3b8', // slate-400
            marginRight: 10,
        },
        buttonSkip: {
            color: '#64748b', // slate-500
        }
    }

    if (!mounted) return null

    return (
        <Joyride
            steps={steps}
            run={run}
            continuous
            showSkipButton
            showProgress
            styles={customStyles}
            callback={handleJoyrideCallback}
            disableOverlayClose={true}
            spotlightClicks={false}
            floaterProps={{
                hideArrow: false,
            }}
        />
    )
}
