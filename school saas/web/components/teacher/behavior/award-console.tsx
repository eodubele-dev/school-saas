"use client"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription, SheetFooter } from "@/components/ui/sheet"
import { Award, Star, Zap, ThumbsUp, Crown, Sparkles, Check, Shield, Heart, Loader2, Lightbulb, Palette, Gem, Smile, BrainCircuit } from "lucide-react"
import { awardBadge } from "@/lib/actions/behavior"
import { toast } from "sonner"
import { Input } from "@/components/ui/input"
import { motion, AnimatePresence } from "framer-motion"
import confetti from "canvas-confetti"
import { useEffect } from "react"
import { getWalletBalance } from "@/lib/actions/communication"
import { NotificationPreviewModal } from "@/components/communication/notification-preview-modal"

const BADGES = [
    { id: 'leadership', title: 'Leadership', icon: Crown },
    { id: 'innovation', title: 'Innovation', icon: Lightbulb },
    { id: 'creativity', title: 'Creativity', icon: Palette },
    { id: 'peer_support', title: 'Peer Support', icon: Smile },
    { id: 'resilience', title: 'Resilience', icon: BrainCircuit },
    { id: 'excellence', title: 'Excellence', icon: Gem },
]

export function AwardConsole({ students }: { students: any[] }) {
    const [selectedStudent, setSelectedStudent] = useState<any>(null)
    const [selectedBadge, setSelectedBadge] = useState<any>(null)
    const [comment, setComment] = useState("")
    const [loading, setLoading] = useState(false)
    const [showPreview, setShowPreview] = useState(false)
    const [walletBalance, setWalletBalance] = useState(0)

    useEffect(() => {
        const fetchBalance = async () => {
            const res = await getWalletBalance()
            if (res.success) setWalletBalance(res.balance)
        }
        fetchBalance()
    }, [])

    const handleAward = () => {
        if (!selectedStudent || !selectedBadge) return
        setShowPreview(true)
    }

    const confirmAward = async () => {
        setShowPreview(false)
        setLoading(true)
        try {
            const res = await awardBadge(selectedStudent.id, {
                title: selectedBadge.title,
                icon_key: selectedBadge.id,
                category: selectedBadge.title,
                comment: comment || `Recognized for ${selectedBadge.title}`
            })

            if (res.success) {
                confetti({
                    particleCount: 100,
                    spread: 60,
                    origin: { y: 0.6 },
                    colors: ['#ffffff', '#a1a1aa', '#3f3f46']
                })

                toast.success(`${selectedBadge.title} Recognized`, {
                    description: `Notification delivered for ${selectedStudent.full_name}.`
                })

                setTimeout(() => {
                    setSelectedStudent(null)
                    setComment("")
                    setSelectedBadge(null)
                }, 300)
            } else {
                toast.error("Failed to award recognition")
            }
        } catch (e) {
            toast.error("An error occurred during verification")
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="space-y-8 font-sans">
            <div className="flex md:flex-row flex-col justify-between items-start md:items-center gap-4">
                <div className="space-y-1.5">
                    <h3 className="text-white font-medium text-2xl tracking-tight">Instant Recognition</h3>
                    <p className="text-[#888] text-sm">Elevate student morale with character-driven achievements.</p>
                </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                {students.map((student) => (
                    <motion.div
                        key={student.id}
                        whileHover={{ y: -2 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => setSelectedStudent(student)}
                    >
                        <Card className="p-5 bg-card text-card-foreground border-border/50 hover:border-[var(--school-accent)] cursor-pointer transition-colors hover:bg-secondary/50 rounded-2xl shadow-sm">
                            <div className="flex flex-col items-center text-center gap-3">
                                <div className="relative">
                                    <Avatar className="h-14 w-14 ring-1 ring-border bg-slate-950">
                                        <AvatarImage src={student.photo_url} className="object-cover" />
                                        <AvatarFallback className="bg-slate-900 text-sm font-medium text-muted-foreground">
                                            {student.full_name.substring(0, 2).toUpperCase()}
                                        </AvatarFallback>
                                    </Avatar>
                                </div>
                                <div className="space-y-0.5">
                                    <span className="text-sm font-medium text-foreground block truncate w-28">{student.full_name}</span>
                                    <span className="text-[11px] text-muted-foreground uppercase tracking-wider">#{student.id.split('-')[0]}</span>
                                </div>
                            </div>
                        </Card>
                    </motion.div>
                ))}
            </div>

            <Sheet open={!!selectedStudent} onOpenChange={(open) => !open && setSelectedStudent(null)}>
                <SheetContent side="right" className="bg-card border-l border-border/50 text-foreground sm:max-w-md p-0 flex flex-col shadow-2xl font-sans">
                    <div className="flex-1 overflow-y-auto px-8 py-10 space-y-10 custom-scrollbar">
                        {/* Minimalist Profile Header */}
                        <div className="flex items-center gap-4 pb-6 border-b border-border/50">
                            <Avatar className="h-12 w-12 ring-1 ring-border bg-slate-950">
                                <AvatarImage src={selectedStudent?.photo_url} className="object-cover" />
                                <AvatarFallback className="text-sm font-medium text-muted-foreground">
                                    {selectedStudent?.full_name?.substring(0, 2).toUpperCase()}
                                </AvatarFallback>
                            </Avatar>
                            <div className="space-y-0.5">
                                <h3 className="text-foreground font-medium text-lg leading-none">{selectedStudent?.full_name}</h3>
                                <div className="flex items-center gap-2 text-muted-foreground text-xs">
                                    <span>ID: {selectedStudent?.id?.split('-')[0] || 'ST-781AAA'}</span>
                                    <span className="w-1 h-1 rounded-full bg-emerald-500/50" />
                                    <span>Active</span>
                                </div>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <h4 className="text-[13px] font-medium text-muted-foreground">Select Recognition</h4>
                            <div className="grid grid-cols-2 gap-3">
                                {BADGES.map((badge) => {
                                    const Icon = badge.icon
                                    const isSelected = selectedBadge?.id === badge.id
                                    return (
                                        <button
                                            key={badge.id}
                                            onClick={() => setSelectedBadge(badge)}
                                            className={`
                                                relative p-4 rounded-xl border text-left flex flex-col gap-3 transition-colors duration-200
                                                ${isSelected
                                                    ? 'bg-blue-600/10 text-blue-400 border-blue-500'
                                                    : 'bg-slate-950 text-muted-foreground border-border/50 hover:border-border hover:text-foreground'}
                                            `}
                                        >
                                            <Icon className={`h-5 w-5 ${isSelected ? 'text-blue-400' : 'text-muted-foreground'}`} />
                                            <span className="text-sm font-medium">
                                                {badge.title}
                                            </span>
                                        </button>
                                    )
                                })}
                            </div>
                        </div>

                        {selectedBadge && (
                            <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="space-y-3"
                            >
                                <div className="flex items-center justify-between">
                                    <label className="text-[13px] font-medium text-muted-foreground">Context Note</label>
                                    <span className="text-[11px] text-muted-foreground/50">Optional</span>
                                </div>
                                <Input
                                    placeholder={`Reason for ${selectedBadge.title}...`}
                                    value={comment}
                                    onChange={(e) => setComment(e.target.value)}
                                    className="bg-slate-950 border-border/50 text-foreground hover:border-border focus:border-[var(--school-accent)] placeholder:text-muted-foreground/50 rounded-xl h-12 shadow-none transition-colors"
                                />
                            </motion.div>
                        )}
                    </div>

                    {/* Minimalist Action Hub */}
                    <div className="p-8 border-t border-border/50 bg-card space-y-4">
                        <Button
                            onClick={handleAward}
                            disabled={!selectedBadge || loading}
                            className={`w-full h-12 rounded-xl text-sm font-medium transition-all shadow-xl ${
                                selectedBadge 
                                ? 'bg-blue-600 text-white hover:bg-blue-700' 
                                : 'bg-slate-950/50 text-muted-foreground hover:bg-slate-900 border border-border/50'
                            }`}
                        >
                            {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : "Confirm Award"}
                        </Button>
                        <p className="text-[11px] text-muted-foreground/70 text-center">
                            A notification will be logged and dispatched.
                        </p>
                    </div>
                </SheetContent>
            </Sheet>

            {showPreview && (
                <NotificationPreviewModal
                    studentName={selectedStudent?.full_name}
                    badgeTitle={selectedBadge?.title}
                    teacherNote={comment}
                    creditStatus={walletBalance >= 5 ? 'Sufficient' : 'Low'}
                    onConfirm={confirmAward}
                    onCancel={() => setShowPreview(false)}
                />
            )}
        </div>
    )
}
