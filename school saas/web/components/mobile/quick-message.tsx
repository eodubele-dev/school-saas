"use client"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Mic, Send, AlertTriangle } from "lucide-react"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "sonner"

export function QuickMessage() {
    const [msg, setMsg] = useState("")
    const [isRecording, setIsRecording] = useState(false)

    const startRecording = () => {
        setIsRecording(true)
        // Stub for Browser Speech API
        // In real app: window.SpeechRecognition...
        setTimeout(() => {
            setIsRecording(false)
            setMsg((prev) => prev + " Please disregard the previous notice, class is resuming normally.")
            toast.success("Voice transcribed!")
        }, 2000)
    }

    const sendBroadcast = () => {
        if (!msg) return
        toast.info("Sending broadcast via Termii...")
        setTimeout(() => toast.success("Message Sent to 24 Parents"), 1500)
        setMsg("")
    }

    return (
        <Card className="p-4 bg-slate-900 border-white/5 space-y-4">
            <div className="flex justify-between items-center">
                <h3 className="text-white font-bold text-sm">Quick Broadcast</h3>
                <Button variant="destructive" size="sm" className="h-7 text-[10px] uppercase font-bold px-2">
                    <AlertTriangle className="h-3 w-3 mr-1" /> Emergency
                </Button>
            </div>

            <div className="relative">
                <Textarea
                    value={msg}
                    onChange={(e) => setMsg(e.target.value)}
                    placeholder="Type message or tap Mic..."
                    className="bg-slate-950 border-white/10 h-24 text-base"
                />
                <Button
                    size="icon"
                    variant="ghost"
                    className={`absolute bottom-2 right-2 h-8 w-8 ${isRecording ? 'bg-red-500/20 text-red-500 animate-pulse' : 'text-slate-400'}`}
                    onClick={startRecording}
                >
                    <Mic className="h-4 w-4" />
                </Button>
            </div>

            <div className="flex gap-2 overflow-x-auto pb-2 noscroll">
                {['Early Closing', 'Sports Day', 'Test Reminder'].map(tag => (
                    <button
                        key={tag}
                        onClick={() => setMsg(prev => prev + ` [${tag}: Details here]`)}
                        className="text-[10px] whitespace-nowrap bg-slate-800 text-slate-300 px-3 py-1.5 rounded-full border border-white/5 hover:bg-slate-700 hover:text-white transition-colors"
                    >
                        {tag}
                    </button>
                ))}
            </div>

            <Button className="w-full bg-[var(--school-accent)] text-white" onClick={sendBroadcast} disabled={!msg}>
                <Send className="h-4 w-4 mr-2" /> Send to All Parents
            </Button>
        </Card>
    )
}
