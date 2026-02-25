"use client"

import { useState, useEffect, useRef } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Loader2, Send, Search, CheckCheck, MessageSquare, Plus, UserPlus } from "lucide-react"
import { getChatThreads, sendChatMessage, getChatRecipients, getOrCreateChannel, getChatMessages } from "@/lib/actions/communication"
import { formatDistanceToNow } from "date-fns"
import { toast } from "sonner"
import { createClient } from "@/lib/supabase/client"
import { cn } from "@/lib/utils"

export function ChatInterface() {
    const [loading, setLoading] = useState(true)
    const [loadingMessages, setLoadingMessages] = useState(false)
    const [loadingRecipients, setLoadingRecipients] = useState(false)
    const [threads, setThreads] = useState<any[]>([])
    const [activeThreadId, setActiveThreadId] = useState<string | null>(null)
    const [messages, setMessages] = useState<any[]>([])
    const [newMessage, setNewMessage] = useState("")
    const [showRecipients, setShowRecipients] = useState(false)
    const [recipients, setRecipients] = useState<any[]>([])
    const [currentUserId, setCurrentUserId] = useState<string | null>(null)

    const messagesEndRef = useRef<HTMLDivElement>(null)
    const supabase = createClient()

    useEffect(() => {
        const fetchUser = async () => {
            const { data: { user } } = await supabase.auth.getUser()
            if (user) setCurrentUserId(user.id)
        }
        fetchUser()
        loadThreads()
    }, [])

    useEffect(() => {
        // Global message subscription for thread list updates
        const syncChannel = supabase
            .channel('user-chat-sync')
            .on(
                'postgres_changes',
                {
                    event: '*', // Listen for all changes (INSERT for messages, UPDATE for read status)
                    schema: 'public',
                    table: 'chat_messages'
                },
                (payload) => {
                    if (payload.eventType === 'INSERT') {
                        setThreads(prev => prev.map(t => {
                            if (t.id === payload.new.channel_id) {
                                return {
                                    ...t,
                                    lastMessage: payload.new,
                                    unreadCount: (t.id !== activeThreadId && payload.new.sender_id !== currentUserId)
                                        ? (t.unreadCount || 0) + 1
                                        : t.unreadCount
                                }
                            }
                            return t
                        }))
                    }
                }
            )
            .on(
                'postgres_changes',
                {
                    event: 'INSERT',
                    schema: 'public',
                    table: 'chat_channels'
                },
                () => {
                    // New channel started - refresh list
                    loadThreads()
                }
            )
            .subscribe()

        return () => {
            supabase.removeChannel(syncChannel)
        }
    }, [activeThreadId, currentUserId])

    useEffect(() => {
        if (activeThreadId) {
            loadMessages(activeThreadId)

            // Active thread subscription for message list
            const channel = supabase
                .channel(`chat:${activeThreadId}`)
                .on(
                    'postgres_changes',
                    {
                        event: 'INSERT',
                        schema: 'public',
                        table: 'chat_messages',
                        filter: `channel_id=eq.${activeThreadId}`
                    },
                    (payload) => {
                        console.log("[CHAT] Active thread payload:", payload)
                        setMessages((prev) => {
                            const isDuplicate = prev.some(m =>
                                m.id === payload.new.id ||
                                (m.isOptimistic && m.content === payload.new.content && m.sender_id === payload.new.sender_id)
                            )

                            if (isDuplicate) {
                                return prev.map(m =>
                                    (m.isOptimistic && m.content === payload.new.content && m.sender_id === payload.new.sender_id)
                                        ? payload.new
                                        : m
                                )
                            }

                            return [...prev, payload.new]
                        })
                    }
                )
                .subscribe()

            return () => {
                supabase.removeChannel(channel)
            }
        }
    }, [activeThreadId])

    useEffect(() => {
        scrollToBottom()
    }, [messages])

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
    }

    const loadThreads = async () => {
        setLoading(true)
        try {
            const res = await getChatThreads()
            if (res.success && res.data) {
                setThreads(res.data)
                if (res.data.length > 0 && !activeThreadId) {
                    setActiveThreadId(res.data[0].id)
                }
            } else {
                toast.error(res.error || "Failed to load chats")
            }
        } catch (e) {
            console.error("[CHAT] Load threads error:", e)
            toast.error("An unexpected error occurred loading chats")
        }
        setLoading(false)
    }

    const loadMessages = async (channelId: string) => {
        setLoadingMessages(true)
        try {
            const res = await getChatMessages(channelId)
            if (res.success && res.data) {
                setMessages(res.data)
                // Local reset of unread count when viewing
                setThreads(prev => prev.map(t =>
                    t.id === channelId ? { ...t, unreadCount: 0 } : t
                ))
            } else {
                toast.error(res.error || "Failed to load messages")
            }
        } catch (e) {
            console.error("[CHAT] Load messages error:", e)
        }
        setLoadingMessages(false)
    }

    const handleNewChat = async () => {
        setLoadingRecipients(true)
        setShowRecipients(true)
        try {
            const res = await getChatRecipients()
            if (res.success && res.data) {
                setRecipients(res.data)
            } else {
                toast.error(res.error || "Failed to load recipients")
                setShowRecipients(false)
            }
        } catch (e) {
            console.error("[CHAT] Fetch recipients error:", e)
            toast.error("Failed to load recipients list")
            setShowRecipients(false)
        }
        setLoadingRecipients(false)
    }

    const initiateChat = async (partnerId: string) => {
        setLoading(true)
        try {
            const res = await getOrCreateChannel(partnerId)
            if (res.success && res.channelId) {
                await loadThreads()
                setActiveThreadId(res.channelId)
                setShowRecipients(false)
                toast.success("Chat initiated")
            } else {
                toast.error(res.error || "Could not start chat")
            }
        } catch (e) {
            console.error("[CHAT] Initiation crash:", e)
            toast.error("A critical error occurred starting the chat")
        }
        setLoading(false)
    }

    const handleSend = async () => {
        if (!activeThreadId || !newMessage.trim() || !currentUserId) return

        const messageContent = newMessage
        const tempId = `temp-${Date.now()}`

        // Optimistic update
        const optimisticMessage = {
            id: tempId,
            channel_id: activeThreadId,
            sender_id: currentUserId,
            content: messageContent,
            created_at: new Date().toISOString(),
            is_read: false,
            isOptimistic: true
        }

        setMessages(prev => [...prev, optimisticMessage])
        setNewMessage("")

        try {
            const res = await sendChatMessage(activeThreadId, messageContent)
            if (!res.success) {
                toast.error("Failed to send message")
                setNewMessage(messageContent)
                setMessages(prev => prev.filter(m => m.id !== tempId))
            }
        } catch (e) {
            toast.error("Error sending message")
            setNewMessage(messageContent)
            setMessages(prev => prev.filter(m => m.id !== tempId))
        }
    }

    const activeThread = threads.find(t => t.id === activeThreadId)

    if (loading && threads.length === 0) return <div className="h-96 flex items-center justify-center"><Loader2 className="h-10 w-10 animate-spin text-blue-500" /></div>

    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-0 border border-white/5 rounded-xl bg-slate-900 overflow-hidden h-[600px] shadow-2xl">
            {/* Thread List */}
            <div className="col-span-1 border-r border-white/5 flex flex-col bg-slate-900/50">
                <div className="p-4 border-b border-white/5 flex items-center gap-2">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                        <Input
                            placeholder="Search chats..."
                            className="bg-slate-950 border-white/10 pl-9 text-sm"
                        />
                    </div>
                    <Button
                        size="icon"
                        variant="ghost"
                        className="text-slate-500 hover:text-white hover:bg-white/10"
                        onClick={loadThreads}
                        title="Refresh chats"
                    >
                        <Loader2 className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
                    </Button>
                    <Button
                        size="icon"
                        variant="ghost"
                        className="bg-blue-500/10 text-blue-400 hover:bg-blue-500/20"
                        onClick={handleNewChat}
                    >
                        {loadingRecipients ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-5 w-5" />}
                    </Button>
                </div>
                <ScrollArea className="flex-1 min-h-0">
                    <div className="flex flex-col">
                        {showRecipients ? (
                            <>
                                <div className="p-2 px-4 text-[10px] font-bold uppercase tracking-widest text-slate-500 bg-white/[0.02] flex items-center justify-between">
                                    New Conversation
                                </div>
                                {recipients.map(recipient => (
                                    <button
                                        key={recipient.id}
                                        onClick={() => initiateChat(recipient.id)}
                                        className="flex items-center gap-3 p-4 text-left transition-colors border-b border-white/5 hover:bg-white/5"
                                    >
                                        <Avatar className="h-8 w-8">
                                            <AvatarImage src={recipient.avatar_url} />
                                            <AvatarFallback>{recipient.full_name?.[0] || 'U'}</AvatarFallback>
                                        </Avatar>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-medium text-slate-200 truncate">{recipient.full_name}</p>
                                            <p className="text-[10px] text-blue-400">{recipient.role}</p>
                                        </div>
                                    </button>
                                ))}
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    className="m-2 text-xs text-slate-500 hover:text-white hover:bg-white/10"
                                    onClick={() => setShowRecipients(false)}
                                >
                                    Cancel
                                </Button>
                            </>
                        ) : (
                            threads.map(thread => (
                                <button
                                    key={thread.id}
                                    onClick={() => {
                                        if (activeThreadId === thread.id) {
                                            loadMessages(thread.id)
                                        } else {
                                            setActiveThreadId(thread.id)
                                        }
                                    }}
                                    className={`flex items-start gap-3 p-4 text-left transition-colors border-b border-white/5 hover:bg-white/5 ${activeThreadId === thread.id ? 'bg-blue-500/10 border-l-2 border-l-blue-500' : ''}`}
                                >
                                    <Avatar>
                                        <AvatarImage src={thread.partner?.avatar_url} />
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
                                    {thread.unreadCount > 0 && activeThreadId !== thread.id && (
                                        <span className="bg-blue-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full min-w-[1.25rem] text-center">
                                            {thread.unreadCount}
                                        </span>
                                    )}
                                </button>
                            )))}
                    </div>
                </ScrollArea>
            </div>

            {/* Chat Area */}
            <div className="col-span-1 md:col-span-2 flex flex-col bg-slate-950/30 relative min-h-0">
                {activeThread ? (
                    <>
                        <div className="p-4 border-b border-white/5 flex items-center justify-between bg-slate-900 sticky top-0 z-10">
                            <div className="flex items-center gap-3">
                                <Avatar className="h-10 w-10">
                                    <AvatarImage src={activeThread.partner?.avatar_url} />
                                    <AvatarFallback>{activeThread.partner?.full_name?.[0]}</AvatarFallback>
                                </Avatar>
                                <div>
                                    <h3 className="font-bold text-white">{activeThread.partner?.full_name}</h3>
                                    <p className="text-xs text-emerald-400 flex items-center gap-1">
                                        <span className="block w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                                        Active
                                    </p>
                                </div>
                            </div>
                        </div>

                        <ScrollArea className="flex-1 p-4 min-h-0">
                            <div className="space-y-4">
                                {loadingMessages ? (
                                    <div className="flex justify-center py-10"><Loader2 className="h-6 w-6 animate-spin text-slate-700" /></div>
                                ) : messages.length === 0 ? (
                                    <div className="text-center text-slate-500 text-sm py-10">No messages yet. Say hello!</div>
                                ) : (
                                    messages.map((m) => {
                                        const isMine = m.sender_id === currentUserId
                                        return (
                                            <div key={m.id} className={`flex ${isMine ? 'justify-end' : 'justify-start'}`}>
                                                <div className={cn(
                                                    "p-3 rounded-2xl max-w-[80%] shadow-lg",
                                                    isMine
                                                        ? "bg-blue-600 text-white rounded-tr-sm"
                                                        : "bg-slate-800 text-slate-100 rounded-tl-sm"
                                                )}>
                                                    <p className="text-sm whitespace-pre-wrap">{m.content}</p>
                                                    <div className={cn(
                                                        "flex items-center gap-1 mt-1 opacity-60 text-[9px] uppercase font-mono",
                                                        isMine ? "justify-end" : "justify-start"
                                                    )}>
                                                        <span>{new Date(m.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                                        {isMine && (m.is_read ? <CheckCheck className="h-3 w-3 text-blue-200" /> : <Send className="h-2 w-2" />)}
                                                    </div>
                                                </div>
                                            </div>
                                        )
                                    })
                                )}
                                <div ref={messagesEndRef} />
                            </div>
                        </ScrollArea>

                        <div className="p-4 bg-slate-900 border-t border-white/5">
                            <form
                                onSubmit={(e) => { e.preventDefault(); handleSend(); }}
                                className="flex items-center gap-2"
                            >
                                <Input
                                    className="bg-slate-950 border-white/10 text-white focus-visible:ring-blue-500"
                                    placeholder="Type a message..."
                                    value={newMessage}
                                    onChange={(e) => setNewMessage(e.target.value)}
                                    autoFocus
                                />
                                <Button type="submit" size="icon" className="bg-blue-600 text-white hover:bg-blue-500" disabled={!newMessage.trim()}>
                                    <Send className="h-4 w-4" />
                                </Button>
                            </form>
                        </div>
                    </>
                ) : (
                    <div className="h-full flex flex-col items-center justify-center text-slate-500">
                        <MessageSquare className="h-16 w-16 mb-4 opacity-10" />
                        <p className="text-lg font-medium opacity-40">Select a conversation</p>
                        <p className="text-sm opacity-20 mt-1">Chat securely with school staff and parents</p>
                    </div>
                )}
            </div>
        </div>
    )
}
