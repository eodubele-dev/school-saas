"use client"

import { useState, useEffect } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Loader2, Send, Search, CheckCheck, MessageSquare } from "lucide-react"
import { getChatThreads, sendChatMessage } from "@/lib/actions/communication"
import { formatDistanceToNow } from "date-fns"

export function ChatInterface() {
    const [loading, setLoading] = useState(true)
    const [threads, setThreads] = useState<any[]>([])
    const [activeThreadId, setActiveThreadId] = useState<string | null>(null)
    const [newMessage, setNewMessage] = useState("")

    useEffect(() => {
        loadThreads()
    }, [])

    const loadThreads = async () => {
        setLoading(true)
        const res = await getChatThreads()
        if (res.success && res.data) {
            setThreads(res.data)
            if (res.data.length > 0 && !activeThreadId) {
                setActiveThreadId(res.data[0].id)
            }
        }
        setLoading(false)
    }

    const handleSend = async () => {
        if (!activeThreadId || !newMessage.trim()) return

        // Optimistic update (skip for brevity in MVP)
        await sendChatMessage(activeThreadId, newMessage)
        setNewMessage("")
        loadThreads() // Reload to see new message
    }

    const activeThread = threads.find(t => t.id === activeThreadId)

    if (loading && threads.length === 0) return <div className="h-96 flex items-center justify-center"><Loader2 className="h-10 w-10 animate-spin text-blue-500" /></div>

    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-0 border border-white/5 rounded-xl bg-slate-900 overflow-hidden h-[600px]">
            {/* Thread List */}
            <div className="col-span-1 border-r border-white/5 flex flex-col bg-slate-900/50">
                <div className="p-4 border-b border-white/5">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                        <Input
                            placeholder="Search chats..."
                            className="bg-slate-950 border-white/10 pl-9 text-sm"
                        />
                    </div>
                </div>
                <ScrollArea className="flex-1">
                    <div className="flex flex-col">
                        {threads.map(thread => (
                            <button
                                key={thread.id}
                                onClick={() => setActiveThreadId(thread.id)}
                                className={`flex items-start gap-3 p-4 text-left transition-colors border-b border-white/5 hover:bg-white/5 ${activeThreadId === thread.id ? 'bg-blue-500/10 border-l-2 border-l-blue-500' : ''}`}
                            >
                                <Avatar>
                                    <AvatarImage src={thread.partner?.photo_url} />
                                    <AvatarFallback>{thread.partner?.full_name?.[0] || 'U'}</AvatarFallback>
                                </Avatar>
                                <div className="flex-1 min-w-0">
                                    <div className="flex justify-between items-baseline mb-1">
                                        <p className="font-medium text-slate-200 truncate">{thread.partner?.full_name}</p>
                                        <span className="text-[10px] text-slate-500">
                                            {thread.lastMessage?.created_at && formatDistanceToNow(new Date(thread.lastMessage.created_at), { addSuffix: true })}
                                        </span>
                                    </div>
                                    <p className="text-xs text-slate-400 truncate">
                                        {thread.lastMessage?.content || "No messages yet"}
                                    </p>
                                </div>
                                {thread.unreadCount > 0 && (
                                    <span className="bg-blue-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full min-w-[1.25rem] text-center">
                                        {thread.unreadCount}
                                    </span>
                                )}
                            </button>
                        ))}
                    </div>
                </ScrollArea>
            </div>

            {/* Chat Area */}
            <div className="col-span-1 md:col-span-2 flex flex-col bg-slate-950/30">
                {activeThread ? (
                    <>
                        <div className="p-4 border-b border-white/5 flex items-center justify-between bg-slate-900">
                            <div className="flex items-center gap-3">
                                <Avatar className="h-10 w-10">
                                    <AvatarImage src={activeThread.partner?.photo_url} />
                                    <AvatarFallback>{activeThread.partner?.full_name?.[0]}</AvatarFallback>
                                </Avatar>
                                <div>
                                    <h3 className="font-bold text-white">{activeThread.partner?.full_name}</h3>
                                    <p className="text-xs text-emerald-400 flex items-center gap-1">
                                        <span className="block w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                                        Online
                                    </p>
                                </div>
                            </div>
                        </div>

                        <ScrollArea className="flex-1 p-4">
                            <div className="space-y-4">
                                {/* Only verify last message for preview, fetching full messages would need another call in real app */}
                                {/* For demo, displaying placeholder if no messages loaded efficiently */}
                                {activeThread.lastMessage ? (
                                    <div className={`flex justify-end`}>
                                        <div className="bg-[var(--school-accent)] text-white p-3 rounded-2xl rounded-tr-sm max-w-[80%]">
                                            <p className="text-sm">{activeThread.lastMessage.content}</p>
                                            <div className="flex items-center justify-end gap-1 mt-1 opacity-70">
                                                <span className="text-[10px]">Just now</span>
                                                <CheckCheck className="h-3 w-3" />
                                            </div>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="text-center text-slate-500 text-sm py-10">Start the conversation...</div>
                                )}
                            </div>
                        </ScrollArea>

                        <div className="p-4 bg-slate-900 border-t border-white/5">
                            <form
                                onSubmit={(e) => { e.preventDefault(); handleSend(); }}
                                className="flex items-center gap-2"
                            >
                                <Input
                                    className="bg-slate-950 border-white/10 text-white"
                                    placeholder="Type a message..."
                                    value={newMessage}
                                    onChange={(e) => setNewMessage(e.target.value)}
                                />
                                <Button type="submit" size="icon" className="bg-[var(--school-accent)] text-white hover:opacity-90">
                                    <Send className="h-4 w-4" />
                                </Button>
                            </form>
                        </div>
                    </>
                ) : (
                    <div className="h-full flex flex-col items-center justify-center text-slate-500">
                        <MessageSquare className="h-12 w-12 mb-4 opacity-20" />
                        <p>Select a conversation to start chatting</p>
                    </div>
                )}
            </div>
        </div>
    )
}
