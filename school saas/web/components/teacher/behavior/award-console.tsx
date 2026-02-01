"use client"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription, SheetFooter } from "@/components/ui/sheet"
import { Award, Star, Zap, ThumbsUp, Crown, Sparkles, Check } from "lucide-react"
import { awardBadge } from "@/lib/actions/behavior"
import { toast } from "sonner"
import { Input } from "@/components/ui/input"

const BADGES = [
    { id: 'neatness_star', title: 'Neatness Star', icon: Sparkles, category: 'behavior', color: 'text-cyan-400' },
    { id: 'math_wizard', title: 'Math Wizard', icon: Zap, category: 'academic', color: 'text-yellow-400' },
    { id: 'punctuality', title: 'Early Bird', icon: Award, category: 'behavior', color: 'text-green-400' },
    { id: 'helper', title: 'Class Helper', icon: ThumbsUp, category: 'leadership', color: 'text-blue-400' },
    { id: 'leader', title: 'Leadership', icon: Crown, category: 'leadership', color: 'text-purple-400' },
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
                icon_key: selectedBadge.id, // simplified mapping
                category: selectedBadge.category,
                comment: comment || `Awarded for ${selectedBadge.title}`
            })

            if (res.success) {
                toast.success(`Badge awarded to ${selectedStudent.full_name}!`)
                setSelectedStudent(null) // Close drawer
                setComment("")
                setSelectedBadge(null)
            } else {
                toast.error("Failed to award badge")
            }
        } catch (e) {
            toast.error("An error occurred")
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="space-y-6">
            <div className="flex md:flex-row flex-col justify-between items-start md:items-center gap-4">
                <div>
                    <h3 className="text-white font-bold text-lg">Instant Recognition</h3>
                    <p className="text-slate-400 text-sm">Click a student to award a badge.</p>
                </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                {students.map((student) => (
                    <Card
                        key={student.id}
                        onClick={() => setSelectedStudent(student)}
                        className="p-4 bg-slate-900 border-white/5 hover:border-[var(--school-accent)] cursor-pointer transition-all hover:bg-slate-800 group"
                    >
                        <div className="flex flex-col items-center text-center gap-3">
                            <Avatar className="h-16 w-16 border-2 border-slate-700 group-hover:border-[var(--school-accent)] transition-colors">
                                <AvatarImage src={student.avatar_url} />
                                <AvatarFallback className="bg-slate-800 text-slate-300 font-bold">
                                    {student.full_name.substring(0, 2)}
                                </AvatarFallback>
                            </Avatar>
                            <span className="text-sm font-medium text-white line-clamp-1">{student.full_name}</span>
                        </div>
                    </Card>
                ))}
            </div>

            {/* Badge Drawer */}
            <Sheet open={!!selectedStudent} onOpenChange={(open) => !open && setSelectedStudent(null)}>
                <SheetContent className="bg-slate-950 border-l border-white/10 text-white sm:max-w-md">
                    <SheetHeader className="mb-6">
                        <SheetTitle className="text-white flex items-center gap-2">
                            Award Badge to <span className="text-[var(--school-accent)]">{selectedStudent?.full_name}</span>
                        </SheetTitle>
                        <SheetDescription className="text-slate-400">
                            Select a badge to add to their digital trophy case.
                        </SheetDescription>
                    </SheetHeader>

                    <div className="space-y-6">
                        <div className="grid grid-cols-2 gap-3">
                            {BADGES.map((badge) => {
                                const Icon = badge.icon
                                const isSelected = selectedBadge?.id === badge.id
                                return (
                                    <div
                                        key={badge.id}
                                        onClick={() => setSelectedBadge(badge)}
                                        className={`
                                            p-3 rounded-xl border cursor-pointer transition-all flex flex-col items-center gap-2 text-center
                                            ${isSelected
                                                ? 'bg-[var(--school-accent)]/10 border-[var(--school-accent)]'
                                                : 'bg-slate-900 border-white/5 hover:bg-slate-800'}
                                        `}
                                    >
                                        <Icon className={`h-6 w-6 ${badge.color}`} />
                                        <span className={`text-xs font-bold ${isSelected ? 'text-white' : 'text-slate-300'}`}>
                                            {badge.title}
                                        </span>
                                    </div>
                                )
                            })}
                        </div>

                        {selectedBadge && (
                            <div className="space-y-2 animate-in fade-in slide-in-from-bottom-2">
                                <label className="text-xs font-medium text-slate-400">Short Note (Optional)</label>
                                <Input
                                    placeholder={`Great job on being a ${selectedBadge.title}!`}
                                    value={comment}
                                    onChange={(e) => setComment(e.target.value)}
                                    className="bg-slate-900 border-white/10 text-white"
                                />
                            </div>
                        )}

                        <SheetFooter>
                            <Button
                                onClick={handleAward}
                                disabled={!selectedBadge || loading}
                                className="w-full bg-[var(--school-accent)] hover:bg-blue-600 text-white font-bold"
                            >
                                {loading ? "Awarding..." : "Send Award"}
                            </Button>
                        </SheetFooter>
                    </div>
                </SheetContent>
            </Sheet>
        </div>
    )
}
