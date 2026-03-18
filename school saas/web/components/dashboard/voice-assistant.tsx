"use client"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Mic, X, Loader2, Sparkles, Navigation, Search, HelpCircle } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { processVoiceCommand, VoiceAction } from "@/lib/actions/voice-command"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { isDesktop } from "@/lib/utils/desktop"

/**
 * AI Voice Assistant (Platinum Edition) 🎙️🤖🏾🇳🇬
 * Modern floating 'Aura' button for hands-free dashboard control.
 */
export function VoiceAssistant() {
    const [mounted, setMounted] = useState(false)
    const [isRecording, setIsRecording] = useState(false)
    const [isProcessing, setIsProcessing] = useState(false)
    const [lastAction, setLastAction] = useState<VoiceAction | null>(null)
    const [showBubble, setShowBubble] = useState(false)
    
    const mediaRecorder = useRef<MediaRecorder | null>(null)
    const chunks = useRef<Blob[]>([])
    const router = useRouter()

    useEffect(() => {
        setMounted(true)
    }, [])

    if (!mounted || !isDesktop()) return null

    const startRecording = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
            const recorder = new MediaRecorder(stream)
            mediaRecorder.current = recorder
            chunks.current = []

            recorder.ondataavailable = (e) => chunks.current.push(e.data)
            recorder.onstop = handleStop
            
            recorder.start()
            setIsRecording(true)
            toast.info("Listening...", { duration: 2000 })
        } catch (err) {
            console.error("Microphone Access Error:", err)
            toast.error("Microphone access denied. Please check system permissions.")
        }
    }

    const stopRecording = () => {
        if (mediaRecorder.current && isRecording) {
            mediaRecorder.current.stop()
            setIsRecording(false)
            // Stop tracks
            mediaRecorder.current.stream.getTracks().forEach(t => t.stop())
        }
    }

    const handleStop = async () => {
        setIsProcessing(true)
        const blob = new Blob(chunks.current, { type: 'audio/webm' })
        const reader = new FileReader()
        
        reader.readAsDataURL(blob)
        reader.onloadend = async () => {
            const base64Audio = (reader.result as string).split(',')[1]
            try {
                const action = await processVoiceCommand(base64Audio)
                executeAction(action)
            } catch (error) {
                toast.error("AI failed to process voice command.")
                setIsProcessing(false)
            }
        }
    }

    const executeAction = (action: VoiceAction) => {
        setLastAction(action)
        setShowBubble(true)
        setIsProcessing(false)

        switch (action.type) {
            case 'NAVIGATE':
                router.push(action.path)
                break
            case 'SEARCH':
                // For now, simulate search or redirect to a search page
                toast.info(`Searching for: ${action.query}`)
                break
        }

        // Hide bubble after 5 seconds
        setTimeout(() => setShowBubble(false), 5000)
    }

    return (
        <div className="fixed bottom-6 right-6 z-[100] flex flex-col items-end gap-3 pointer-events-none">
            {/* AI Response Bubble */}
            <AnimatePresence>
                {showBubble && lastAction && (
                    <motion.div
                        initial={{ opacity: 0, y: 10, scale: 0.9 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                        className="bg-white border shadow-2xl rounded-2xl p-4 max-w-xs pointer-events-auto"
                    >
                        <div className="flex items-start gap-3">
                            <div className="p-2 bg-primary/10 rounded-full shrink-0">
                                {lastAction.type === 'NAVIGATE' && <Navigation className="w-4 h-4 text-primary" />}
                                {lastAction.type === 'SEARCH' && <Search className="w-4 h-4 text-primary" />}
                                {lastAction.type === 'QUERY_STAT' && <Sparkles className="w-4 h-4 text-primary" />}
                                {lastAction.type === 'UNKNOWN' && <HelpCircle className="w-4 h-4 text-orange-500" />}
                            </div>
                            <div className="space-y-1">
                                <p className="text-sm font-medium leading-tight">{lastAction.message}</p>
                                {lastAction.type === 'QUERY_STAT' && (
                                    <p className="text-xs text-muted-foreground bg-muted p-2 rounded-md font-mono">
                                        {lastAction.data}
                                    </p>
                                )}
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Aura Microphone Button */}
            <div className="pointer-events-auto relative">
                <AnimatePresence>
                    {isRecording && (
                        <motion.div
                            initial={{ scale: 0.8, opacity: 0 }}
                            animate={{ scale: [1, 1.3, 1], opacity: [0.3, 0.1, 0.3] }}
                            transition={{ repeat: Infinity, duration: 2 }}
                            className="absolute inset-0 bg-primary rounded-full z-[-1]"
                        />
                    )}
                </AnimatePresence>

                <Button
                    size="icon"
                    className={`h-14 w-14 rounded-full shadow-2xl transition-all duration-300 transform 
                        ${isRecording ? 'bg-red-500 hover:bg-red-600 scale-110' : 'bg-primary hover:scale-105'}
                    `}
                    onMouseDown={startRecording}
                    onMouseUp={stopRecording}
                    onMouseLeave={stopRecording}
                    onTouchStart={startRecording}
                    onTouchEnd={stopRecording}
                >
                    {isProcessing ? (
                        <Loader2 className="w-6 h-6 animate-spin" />
                    ) : isRecording ? (
                        <Sparkles className="w-6 h-6 text-white" />
                    ) : (
                        <Mic className="w-6 h-6" />
                    )}
                </Button>
            </div>
        </div>
    )
}
