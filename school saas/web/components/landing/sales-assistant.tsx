"use client"

import { useState, useRef, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { MessageSquare, X, Send, Loader2, Sparkles, Building2 } from "lucide-react"
import { cn } from "@/lib/utils"

export function SalesAssistant() {
    const [isOpen, setIsOpen] = useState(false)
    const [messages, setMessages] = useState<{ role: 'user' | 'assistant', content: string }[]>([
        { role: 'assistant', content: "Welcome to EduFlow. I'm your Institutional Growth Consultant. How can I help you recover revenue and modernize your campus today?" }
    ])
    const [input, setInput] = useState("")
    const [isLoading, setIsLoading] = useState(false)
    const [unreadCount, setUnreadCount] = useState(1)
    const scrollRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        if (isOpen) setUnreadCount(0)
    }, [isOpen])

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight
        }
    }, [messages, isLoading])

    const handleSend = async () => {
        if (!input.trim() || isLoading) return

        const userMsg = input.trim()
        setInput("")
        setMessages(prev => [...prev, { role: 'user', content: userMsg }])
        setIsLoading(true)

        try {
            const response = await fetch("/api/sales-chat", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ messages: [...messages, { role: 'user', content: userMsg }] })
            })

            const data = await response.json()
            if (data.text) {
                setMessages(prev => [...prev, { role: 'assistant', content: data.text }])
            } else {
                setMessages(prev => [...prev, { role: 'assistant', content: "I'm experiencing a brief uplink delay. Please try again or book a physical demo." }])
            }
        } catch (error) {
            setMessages(prev => [...prev, { role: 'assistant', content: "My connection is currently unstable. Would you like to speak to our Lagos team directly?" }])
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <div className="fixed bottom-6 right-6 md:bottom-10 md:right-10 z-[90]">
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9, y: 20, transformOrigin: "bottom right" }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9, y: 20 }}
                        className="absolute bottom-20 right-0 w-[90vw] md:w-[400px] h-[500px] bg-[#0F1115] border border-white/10 rounded-3xl shadow-[0_20px_60px_rgba(0,0,0,0.8)] flex flex-col overflow-hidden backdrop-blur-2xl"
                    >
                        {/* Header */}
                        <div className="p-5 border-b border-border/50 bg-blue-600/10 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center shadow-[0_0_15px_rgba(37,99,235,0.4)]">
                                    <Sparkles className="w-5 h-5 text-white" />
                                </div>
                                <div className="leading-tight">
                                    <h3 className="font-bold text-foreground flex items-center gap-2">
                                        EduFlow Assistant
                                        <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                                    </h3>
                                    <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-mono">Sales & Growth Consultant</p>
                                </div>
                            </div>
                            <button 
                                onClick={() => setIsOpen(false)}
                                className="p-2 hover:bg-white/5 rounded-full text-muted-foreground hover:text-foreground transition-colors"
                                aria-label="Close Sales Assistant"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        {/* Messages Area */}
                        <div 
                            ref={scrollRef}
                            className="flex-1 overflow-y-auto p-5 space-y-4 custom-scrollbar"
                        >
                            {messages.map((msg, i) => (
                                <div key={i} className={cn(
                                    "flex flex-col gap-1.5",
                                    msg.role === 'user' ? "items-end" : "items-start"
                                )}>
                                    <div className={cn(
                                        "p-4 rounded-2xl max-w-[85%] text-sm leading-relaxed",
                                        msg.role === 'user' 
                                            ? "bg-blue-600 text-white rounded-tr-none shadow-lg shadow-blue-900/20" 
                                            : "bg-white/5 text-slate-200 border border-white/10 rounded-tl-none"
                                    )}>
                                        {msg.content}
                                    </div>
                                    <span className="text-[9px] text-slate-500 font-mono uppercase tracking-tighter">
                                        {msg.role === 'user' ? 'Client Request' : 'EduFlow AI Response'}
                                    </span>
                                </div>
                            ))}
                            {isLoading && (
                                <div className="flex items-center gap-3 text-slate-500 italic text-sm p-4 bg-white/5 rounded-2xl border border-white/5">
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                    Synthesizing growth strategy...
                                </div>
                            )}
                        </div>

                        {/* Input Area */}
                        <div className="p-5 border-t border-border/50 bg-white/[0.02]">
                            <div className="flex items-center gap-2 bg-black/40 border border-white/10 rounded-2xl p-1.5 focus-within:border-blue-500/50 transition-all">
                                <input 
                                    type="text"
                                    value={input}
                                    onChange={(e) => setInput(e.target.value)}
                                    onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                                    placeholder="Ask about pricing or demos..."
                                    className="flex-1 bg-transparent border-none focus:ring-0 text-foreground text-sm px-3"
                                    aria-label="Type your message"
                                />
                                <button
                                    onClick={handleSend}
                                    disabled={!input.trim() || isLoading}
                                    className="p-3 rounded-xl bg-blue-600 text-white hover:bg-blue-500 disabled:opacity-50 disabled:hover:scale-100 transition-all hover:scale-105 active:scale-95 shadow-lg shadow-blue-900/30"
                                    aria-label="Send message"
                                >
                                    <Send className="w-4 h-4" />
                                </button>
                            </div>
                            <p className="text-[9px] text-center text-slate-500 mt-3 font-mono tracking-widest uppercase">
                                Secure Sales Channel // EF-Lag-Consult-V1
                            </p>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Toggle Button */}
            {!isOpen && (
                <motion.button
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setIsOpen(true)}
                    className="w-16 h-16 rounded-full bg-blue-600 text-white shadow-[0_0_30px_rgba(37,99,235,0.4)] flex items-center justify-center relative group"
                    aria-label="Open AI Sales Assistant"
                >
                    <div className="absolute inset-0 bg-gradient-to-tr from-blue-700 to-cyan-500 opacity-0 group-hover:opacity-100 transition-opacity rounded-full" />
                    <MessageSquare className="w-8 h-8 relative z-10 group-hover:rotate-12 transition-transform" />
                    
                    {/* Notification Badge */}
                    <AnimatePresence>
                        {unreadCount > 0 && (
                            <motion.div 
                                initial={{ scale: 0, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                exit={{ scale: 0, opacity: 0 }}
                                className="absolute -top-1 -right-1 w-6 h-6 bg-red-500 border-2 border-[#0A0A0B] rounded-full flex items-center justify-center text-[11px] font-bold z-20 text-white shadow-lg"
                            >
                                {unreadCount}
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {/* Magnetic Pulsing Rings */}
                    <div className="absolute inset-0 rounded-full border border-blue-400 opacity-20 animate-ping" />
                </motion.button>
            )}
        </div>
    )
}
