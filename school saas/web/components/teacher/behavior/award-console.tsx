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

const BADGES = [
    { id: 'leadership', title: 'Leadership', icon: Crown, category: 'Leadership', color: 'text-purple-400', glow: 'shadow-[0_0_20px_rgba(168,85,247,0.3)]', activeGlow: 'shadow-[0_0_40px_rgba(168,85,247,0.5)]', bg: 'bg-purple-500/5', border: 'border-purple-500/20' },
    { id: 'innovation', title: 'Innovation', icon: Lightbulb, category: 'Innovation', color: 'text-cyan-400', glow: 'shadow-[0_0_20px_rgba(6,182,212,0.3)]', activeGlow: 'shadow-[0_0_40px_rgba(6,182,212,0.5)]', bg: 'bg-cyan-500/5', border: 'border-cyan-500/20' },
    { id: 'creativity', title: 'Creativity', icon: Palette, category: 'Creativity', color: 'text-pink-400', glow: 'shadow-[0_0_20px_rgba(236,72,153,0.3)]', activeGlow: 'shadow-[0_0_40px_rgba(236,72,153,0.5)]', bg: 'bg-pink-500/5', border: 'border-pink-500/20' },
    { id: 'peer_support', title: 'Peer Support', icon: Smile, category: 'Peer Support', color: 'text-emerald-400', glow: 'shadow-[0_0_20px_rgba(16,185,129,0.3)]', activeGlow: 'shadow-[0_0_40px_rgba(16,185,129,0.5)]', bg: 'bg-emerald-500/5', border: 'border-emerald-500/20' },
    { id: 'resilience', title: 'Resilience', icon: BrainCircuit, category: 'Resilience', color: 'text-indigo-400', glow: 'shadow-[0_0_20px_rgba(99,102,241,0.3)]', activeGlow: 'shadow-[0_0_40px_rgba(99,102,241,0.5)]', bg: 'bg-indigo-500/5', border: 'border-indigo-500/20' },
    { id: 'excellence', title: 'Excellence', icon: Gem, category: 'Excellence', color: 'text-amber-400', glow: 'shadow-[0_0_20px_rgba(245,158,11,0.3)]', activeGlow: 'shadow-[0_0_40px_rgba(245,158,11,0.5)]', bg: 'bg-amber-500/5', border: 'border-amber-500/20' },
]

export function AwardConsole({ students }: { students: any[] }) {
    const [selectedStudent, setSelectedStudent] = useState<any>(null)
    const [selectedBadge, setSelectedBadge] = useState<any>(null)
    const [comment, setComment] = useState("")
    const [loading, setLoading] = useState(false)

    const handleAward = async () => {
        if (!selectedStudent || !selectedBadge) return

        setLoading(true)
        try {
            const res = await awardBadge(selectedStudent.id, {
                title: selectedBadge.title,
                icon_key: selectedBadge.id,
                category: selectedBadge.category,
                comment: comment || `Recognized for ${selectedBadge.title}`
            })

            if (res.success) {
                // Micro-animation: Confetti Burst
                confetti({
                    particleCount: 150,
                    spread: 70,
                    origin: { y: 0.6 },
                    colors: ['#06b6d4', '#8b5cf6', '#ec4899']
                })

                toast.success(`${selectedBadge.title} Badge awarded!`, {
                    description: `Parent nudge triggered for ${selectedStudent.full_name}.`
                })

                // Close drawer after short delay
                setTimeout(() => {
                    setSelectedStudent(null)
                    setComment("")
                    setSelectedBadge(null)
                }, 500)
            } else {
                toast.error("Failed to award badge")
            }
        } catch (e) {
            toast.error("An error occurred during verification")
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="space-y-6">
            <div className="flex md:flex-row flex-col justify-between items-start md:items-center gap-4">
                <div className="space-y-1">
                    <h3 className="text-white font-bold text-xl tracking-tight">Instant Recognition</h3>
                    <p className="text-slate-400 text-sm font-sans">Elevate student morale with character-driven achievements.</p>
                </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-6">
                {students.map((student) => (
                    <motion.div
                        key={student.id}
                        whileHover={{ scale: 1.02, y: -4 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => setSelectedStudent(student)}
                    >
                        <Card className="p-5 bg-black/40 border-white/5 hover:border-cyan-500/40 cursor-pointer transition-all hover:bg-slate-900/60 group backdrop-blur-xl relative overflow-hidden rounded-3xl shadow-2xl">
                            <div className="flex flex-col items-center text-center gap-4 relative z-10">
                                <div className="relative">
                                    <Avatar className="h-20 w-20 border-2 border-slate-800 bg-slate-950 group-hover:border-cyan-500/60 transition-all duration-500 shadow-[0_0_30px_rgba(0,0,0,0.5)]">
                                        <AvatarImage src={student.avatar_url} className="object-cover" />
                                        <AvatarFallback className="bg-slate-950 text-2xl font-black text-slate-700 group-hover:text-cyan-400 transition-colors">
                                            {student.full_name.substring(0, 2).toUpperCase()}
                                        </AvatarFallback>
                                    </Avatar>
                                    <div className="absolute -bottom-1 -right-1 h-6 w-6 rounded-full bg-emerald-500 border-4 border-black box-content" />
                                </div>
                                <div className="space-y-1">
                                    <span className="text-sm font-black text-white block truncate w-32 tracking-tight">{student.full_name}</span>
                                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest font-mono">#{student.id.split('-')[0]}</span>
                                </div>
                            </div>
                            <div className="absolute inset-0 bg-gradient-to-tr from-cyan-500/[0.05] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                        </Card>
                    </motion.div>
                ))}
            </div>

            {/* Hyper-Premium Obsidian Drawer */}
            <Sheet open={!!selectedStudent} onOpenChange={(open) => !open && setSelectedStudent(null)}>
                <SheetContent side="right" className="bg-[#050506] backdrop-blur-3xl border-l border-white/5 text-white sm:max-w-md p-0 overflow-hidden flex flex-col shadow-[-20px_0_100px_rgba(0,0,0,0.8)]">
                    <div className="flex-1 overflow-y-auto px-8 py-10 space-y-10 custom-scrollbar">
                        {/* Digital Identity Header */}
                        <div className="relative group">
                            <div className="absolute -inset-1 bg-gradient-to-r from-cyan-500/20 to-purple-500/20 rounded-3xl blur opacity-25 group-hover:opacity-50 transition duration-1000 group-hover:duration-200"></div>
                            <div className="relative bg-white rounded-3xl p-7 flex items-center gap-5 shadow-2xl">
                                <Avatar className="h-16 w-16 border-4 border-slate-50 ring-2 ring-slate-100/50 shadow-2xl">
                                    <AvatarImage src={selectedStudent?.avatar_url} />
                                    <AvatarFallback className="bg-slate-50 text-xl font-black text-slate-300 italic">
                                        {selectedStudent?.full_name?.substring(0, 2).toUpperCase()}
                                    </AvatarFallback>
                                </Avatar>
                                <div className="space-y-1">
                                    <h3 className="text-slate-900 font-extrabold text-2xl leading-none tracking-tighter">{selectedStudent?.full_name}</h3>
                                    <div className="flex items-center gap-3">
                                        <Badge variant="outline" className="border-slate-200 text-slate-400 font-mono text-[10px] uppercase font-bold px-2.5 py-1 whitespace-nowrap">
                                            ID: {selectedStudent?.id?.split('-')[0] || 'ST-781AAA'}
                                        </Badge>
                                        <div className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="space-y-6">
                            <div className="flex items-center gap-4 px-1">
                                <div className="h-[1px] flex-1 bg-white/5" />
                                <h4 className="text-[11px] font-black uppercase tracking-[0.3em] text-slate-500/80">Select Character Badge</h4>
                                <div className="h-[1px] flex-1 bg-white/5" />
                            </div>

                            {/* Floating Gem Award Grid */}
                            <div className="grid grid-cols-3 gap-4">
                                <AnimatePresence>
                                    {BADGES.map((badge, idx) => {
                                        const Icon = badge.icon
                                        const isSelected = selectedBadge?.id === badge.id
                                        return (
                                            <motion.button
                                                key={badge.id}
                                                initial={{ opacity: 0, y: 20 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                transition={{ delay: idx * 0.05, type: 'spring', damping: 15 }}
                                                onClick={() => setSelectedBadge(badge)}
                                                className={`
                                                    relative p-5 rounded-[2rem] border transition-all duration-500 flex flex-col items-center gap-3 group
                                                    ${isSelected
                                                        ? `${badge.border} bg-white/[0.07] ${badge.activeGlow}`
                                                        : 'bg-white/[0.02] border-white/5 hover:border-white/10 hover:bg-white/[0.04]'}
                                                `}
                                            >
                                                <div className={`p-3 rounded-2xl transition-all duration-500 ${isSelected ? 'scale-125 rotate-6' : 'group-hover:scale-110'} ${badge.color} ${isSelected ? badge.glow : ''}`}>
                                                    <Icon className="h-7 w-7 stroke-[2.5]" />
                                                </div>
                                                <span className={`text-[10px] font-black uppercase tracking-widest text-center leading-none ${isSelected ? 'text-white' : 'text-slate-600'}`}>
                                                    {badge.title}
                                                </span>
                                                {isSelected && (
                                                    <motion.div
                                                        layoutId="active-diamond"
                                                        className="absolute -top-2 -right-2 bg-white rounded-full p-1 shadow-2xl"
                                                    >
                                                        <div className="bg-cyan-500 rounded-full p-0.5">
                                                            <Check className="h-2.5 w-2.5 text-white stroke-[4px]" />
                                                        </div>
                                                    </motion.div>
                                                )}
                                            </motion.button>
                                        )
                                    })}
                                </AnimatePresence>
                            </div>
                        </div>

                        {selectedBadge && (
                            <motion.div
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="space-y-4"
                            >
                                <div className="flex items-center justify-between px-1">
                                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">Forensic Comment</label>
                                    <span className="text-[9px] text-cyan-500/50 font-mono italic">Optional entry</span>
                                </div>
                                <div className="group relative">
                                    <div className="absolute -inset-0.5 bg-cyan-500/20 rounded-2xl blur opacity-0 group-hover:opacity-100 transition duration-500"></div>
                                    <Input
                                        placeholder={`Reason for ${selectedBadge.title} recognition...`}
                                        value={comment}
                                        onChange={(e) => setComment(e.target.value)}
                                        className="relative bg-black/60 border-white/10 text-white h-16 rounded-2xl px-6 focus:border-cyan-500/50 placeholder:text-slate-700 transition-all font-sans text-sm"
                                    />
                                </div>
                            </motion.div>
                        )}
                    </div>

                    {/* Platinum Control Hub */}
                    <div className="p-8 bg-black/60 border-t border-white/5 backdrop-blur-2xl space-y-6">
                        <div className="relative group">
                            <div className="absolute -inset-1 bg-cyan-500/30 rounded-2xl blur-md opacity-0 group-hover:opacity-100 transition duration-500"></div>
                            <Button
                                onClick={handleAward}
                                disabled={!selectedBadge || loading}
                                className="relative w-full h-16 bg-[#00E5FF] hover:bg-white text-black font-black text-xl rounded-2xl shadow-[0_0_40px_rgba(0,229,255,0.2)] transition-all active:scale-[0.97] disabled:opacity-20 flex items-center justify-center gap-3 overflow-hidden group/btn"
                            >
                                {loading ? (
                                    <Loader2 className="h-6 w-6 animate-spin" />
                                ) : (
                                    <>
                                        <span className="uppercase tracking-tighter">Award Recognition</span>
                                        <div className="p-1 rounded-lg bg-black/10 group-hover/btn:bg-cyan-500/10 transition-colors">
                                            <Zap className="h-5 w-5 fill-black group-hover:animate-pulse" />
                                        </div>
                                    </>
                                )}
                                <div className="absolute inset-x-0 bottom-0 h-1 bg-black/10 transform scale-x-0 group-hover/btn:scale-x-100 transition-transform duration-500 origin-left" />
                            </Button>
                        </div>
                        <div className="flex flex-col items-center gap-2">
                            <p className="text-[10px] font-black text-slate-600 uppercase tracking-[0.4em] font-mono text-center">
                                Forensic System <span className="text-cyan-400">Locked</span>
                            </p>
                            <div className="flex items-center gap-4 w-full">
                                <div className="h-[1px] flex-1 bg-white/5" />
                                <div className="h-1 w-1 rounded-full bg-slate-800" />
                                <div className="h-[1px] flex-1 bg-white/5" />
                            </div>
                        </div>
                    </div>
                </SheetContent>
            </Sheet>
        </div>
    )
}
