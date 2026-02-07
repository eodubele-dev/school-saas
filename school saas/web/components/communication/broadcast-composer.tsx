"use client"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Loader2, Send, MessageSquare, Phone, Mail, Paperclip } from "lucide-react"
import { toast } from "sonner"
import { sendBroadcast } from "@/lib/actions/communication"

export function BroadcastComposer() {
    const [sending, setSending] = useState(false)
    const [channel, setChannel] = useState<'sms' | 'whatsapp' | 'email'>('sms')

    const searchParams = typeof window !== 'undefined' ? new URLSearchParams(window.location.search) : new URLSearchParams()
    const defaultMessage = searchParams.get('message') || ""

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        setSending(true)

        const form = new FormData(e.currentTarget)
        const message = form.get('message') as string
        const audience = form.get('audience') as string

        try {
            const res = await sendBroadcast(channel, 'class', audience, message)
            if (res.success) {
                toast.success(`Broadcast queued via ${channel.toUpperCase()}`)
                // Reset form?
            } else {
                toast.error("Failed to send broadcast")
            }
        } catch (_error) {
            toast.error("An error occurred")
        }
        setSending(false)
    }

    return (
        <Card className="bg-slate-900 border-white/5 p-6 h-full flex flex-col">
            <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
                <Send className="h-5 w-5 text-blue-400" />
                Compose Broadcast
            </h3>

            <form onSubmit={handleSubmit} className="space-y-6 flex-1 flex flex-col">
                <div className="space-y-2">
                    <Label className="text-slate-400">Audience</Label>
                    <Select name="audience" defaultValue="all_parents">
                        <SelectTrigger className="bg-slate-950 border-white/10 text-white">
                            <SelectValue placeholder="Select Recipients" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all_parents">All Parents</SelectItem>
                            <SelectItem value="jss1a">JSS 1A Parents</SelectItem>
                            <SelectItem value="ss3b">SS 3B Parents</SelectItem>
                            <SelectItem value="staff">All Staff</SelectItem>
                        </SelectContent>
                    </Select>
                </div>

                <div className="space-y-2">
                    <Label className="text-slate-400">Channel</Label>
                    <div className="grid grid-cols-3 gap-2">
                        <Button
                            type="button"
                            variant={channel === 'sms' ? 'default' : 'outline'}
                            className={`${channel === 'sms' ? 'bg-[var(--school-accent)]' : 'border-white/10 text-slate-400'}`}
                            onClick={() => setChannel('sms')}
                        >
                            <MessageSquare className="h-4 w-4 mr-2" /> SMS
                        </Button>
                        <Button
                            type="button"
                            variant={channel === 'whatsapp' ? 'default' : 'outline'}
                            className={`${channel === 'whatsapp' ? 'bg-green-600 hover:bg-green-700' : 'border-white/10 text-slate-400'}`}
                            onClick={() => setChannel('whatsapp')}
                        >
                            <Phone className="h-4 w-4 mr-2" /> WhatsApp
                        </Button>
                        <Button
                            type="button"
                            variant={channel === 'email' ? 'default' : 'outline'}
                            className={`${channel === 'email' ? 'bg-slate-100 text-slate-900' : 'border-white/10 text-slate-400'}`}
                            onClick={() => setChannel('email')}
                        >
                            <Mail className="h-4 w-4 mr-2" /> Email
                        </Button>
                    </div>
                </div>

                <div className="space-y-2 flex-1">
                    <Label className="text-slate-400">Message</Label>
                    <Textarea
                        name="message"
                        required
                        defaultValue={defaultMessage}
                        className="bg-slate-950 border-white/10 text-white resize-none h-full min-h-[150px]"
                        placeholder="Type your message here..."
                    />
                </div>

                <div className="flex items-center justify-between pt-2">
                    <Button type="button" variant="ghost" className="text-slate-400 hover:text-white hover:bg-white/10">
                        <Paperclip className="h-4 w-4 mr-2" /> Attach File
                    </Button>
                    <Button type="submit" disabled={sending} className="bg-[var(--school-accent)] text-white w-32">
                        {sending ? <Loader2 className="h-4 w-4 animate-spin" /> : "Send Now"}
                    </Button>
                </div>
            </form>
        </Card>
    )
}
