'use client'

import { useState, useRef, useEffect } from "react"
import { Send, Bot, User, Sparkles, LifeBuoy, AlertCircle, Phone, ArrowUpRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { toast } from "sonner"
import { cn } from "@/lib/utils"

export default function HelpPage({ params }: { params: { domain: string } }) {
    const [messages, setMessages] = useState<{ role: 'user' | 'assistant', content: string }[]>([
        { role: 'assistant', content: "Hello! I'm the EduFlow Assistant. How can I help you manage your school today?" }
    ])
    const [input, setInput] = useState("")
    const [loading, setLoading] = useState(false)
    const [escalated, setEscalated] = useState(false)
    const scrollRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollIntoView({ behavior: "smooth" })
        }
    }, [messages])

    const handleSend = async () => {
        if (!input.trim()) return

        const userMsg = input
        setInput("")
        setMessages(prev => [...prev, { role: 'user', content: userMsg }])
        setLoading(true)

        try {
            const res = await fetch('/api/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    messages: [...messages, { role: 'user', content: userMsg }],
                    domain: params.domain
                })
            })

            const data = await res.json()

            if (data.error) throw new Error(data.error)

            setMessages(prev => [...prev, { role: 'assistant', content: data.text }])
        } catch (error) {
            toast.error("Failed to connect to AI Assistant. Please try again.")
        } finally {
            setLoading(false)
        }
    }

    const handleEscalation = () => {
        // Mock escalation to Termii
        setEscalated(true)
        toast.success("Support Ticket Created", {
            description: "A transcript of this chat has been sent to our Human Support Team. They will call you shortly."
        })
    }

    const QuickStartCard = ({ icon: Icon, title, question }: { icon: any, title: string, question: string }) => (
        <button
            onClick={() => {
                setInput(question)
                // Optional: Auto-send
            }}
            className="flex flex-col items-center justify-center p-4 bg-slate-900/50 hover:bg-slate-800 border border-white/10 hover:border-blue-500/50 rounded-xl transition-all group text-center h-32"
        >
            <div className="h-10 w-10 rounded-full bg-blue-500/10 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                <Icon className="h-5 w-5 text-blue-400" />
            </div>
            <span className="text-xs font-semibold text-slate-300 group-hover:text-white mb-1">{title}</span>
        </button>
    )

    return (
        <div className="h-screen flex flex-col bg-slate-950 text-slate-200">
            {/* Header */}
            <div className="h-16 border-b border-white/10 flex items-center px-6 bg-slate-900/50 backdrop-blur-md sticky top-0 z-10 w-full justify-between">
                <div className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-purple-900/20">
                        <Sparkles className="h-4 w-4 text-white" />
                    </div>
                    <div>
                        <h1 className="font-bold text-white leading-none">AI Help Desk</h1>
                        <p className="text-[10px] text-slate-400 font-mono mt-1">POWERED BY GEMINI 1.5 FLASH</p>
                    </div>
                </div>

                {messages.length > 2 && !escalated && (
                    <Button variant="outline" size="sm" onClick={handleEscalation} className="hidden sm:flex border-red-900/30 text-red-400 hover:bg-red-950/50 hover:text-red-300">
                        <Phone className="mr-2 h-3.5 w-3.5" />
                        Talk to Human
                    </Button>
                )}
            </div>

            <div className="flex-1 flex overflow-hidden">
                {/* Chat Area */}
                <div className="flex-1 flex flex-col max-w-3xl mx-auto w-full border-x border-white/5 bg-slate-950/30">
                    <ScrollArea className="flex-1 p-4 sm:p-6">
                        <div className="space-y-6 pb-4">
                            {/* Intro / Quick Start (Only show if few messages) */}
                            {messages.length === 1 && (
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                                    <QuickStartCard icon={User} title="Add Student" question="How do I add a new student?" />
                                    <QuickStartCard icon={Sparkles} title="AI Remarks" question="How do I generate AI remarks?" />
                                    <QuickStartCard icon={AlertCircle} title="Troubleshoot" question="Troubleshoot my printer connection." />
                                    <QuickStartCard icon={LifeBuoy} title="Grading" question="How to setup grade scales?" />
                                </div>
                            )}

                            {messages.map((msg, i) => (
                                <div key={i} className={cn("flex gap-4", msg.role === 'user' ? "flex-row-reverse" : "")}>
                                    <Avatar className={cn("h-8 w-8 border", msg.role === 'assistant' ? "border-purple-500/50" : "border-slate-700")}>
                                        <AvatarFallback className={cn(msg.role === 'assistant' ? "bg-purple-900/20 text-purple-400" : "bg-slate-800 text-slate-400")}>
                                            {msg.role === 'assistant' ? <Bot className="h-4 w-4" /> : <User className="h-4 w-4" />}
                                        </AvatarFallback>
                                    </Avatar>
                                    <div className={cn(
                                        "rounded-2xl px-4 py-3 text-sm max-w-[80%]",
                                        msg.role === 'user'
                                            ? "bg-blue-600 text-white rounded-br-none"
                                            : "bg-slate-900 border border-white/10 text-slate-300 rounded-bl-none shadow-sm"
                                    )}>
                                        {/* Simple Markdown rendering for links */}
                                        <div dangerouslySetInnerHTML={{
                                            __html: msg.content.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" class="text-blue-400 hover:underline font-medium inline-flex items-center gap-0.5">$1<svg class="h-3 w-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M7 17L17 7M17 7H7M17 7V17"/></svg></a>')
                                        }} />
                                    </div>
                                </div>
                            ))}

                            {loading && (
                                <div className="flex gap-4">
                                    <div className="h-8 w-8 rounded-full bg-purple-900/20 flex items-center justify-center border border-purple-500/50">
                                        <Bot className="h-4 w-4 text-purple-400 animate-pulse" />
                                    </div>
                                    <div className="flex items-center gap-1 h-10 px-4 bg-slate-900/50 rounded-2xl border border-white/5">
                                        <div className="h-1.5 w-1.5 bg-slate-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                                        <div className="h-1.5 w-1.5 bg-slate-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                                        <div className="h-1.5 w-1.5 bg-slate-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                                    </div>
                                </div>
                            )}
                            <div ref={scrollRef} />
                        </div>
                    </ScrollArea>

                    {/* Input Area */}
                    <div className="p-4 border-t border-white/10 bg-slate-900/80 backdrop-blur-md">
                        <div className="relative flex items-center gap-2 max-w-3xl mx-auto">
                            <Input
                                value={input}
                                onChange={e => setInput(e.target.value)}
                                onKeyDown={e => e.key === 'Enter' && handleSend()}
                                placeholder="Ask EduFlow Assistant..."
                                className="bg-slate-950 border-white/10 pr-12 h-12 rounded-xl focus-visible:ring-purple-500/50 text-base"
                            />
                            <Button
                                onClick={handleSend}
                                size="icon"
                                className="absolute right-1.5 top-1.5 h-9 w-9 bg-blue-600 hover:bg-blue-500 text-white rounded-lg transition-colors"
                            >
                                <Send className="h-4 w-4" />
                            </Button>
                        </div>
                        <p className="text-[10px] text-center text-slate-500 mt-2">
                            AI responses are generated from the User Manual. Verify critical info.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    )
}
