"use client"

import { useState } from "react"
import { Search, Plus, BookOpen, Check } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { bulkAddNigerianSubjects, updateSubjectMapping } from "@/lib/actions/academic"
import { toast } from "sonner"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"

export function SubjectManager({ subjects, classes, domain }: { subjects: any[], classes: any[], domain: string }) {
    const [search, setSearch] = useState("")
    const [selectedSubject, setSelectedSubject] = useState<any>(null)
    const [loading, setLoading] = useState(false)
    const [mappingModalOpen, setMappingModalOpen] = useState(false)
    const [selectedClassIds, setSelectedClassIds] = useState<string[]>([])

    const filtered = subjects.filter(s => s.name.toLowerCase().includes(search.toLowerCase()))

    const handleBulkAdd = async () => {
        setLoading(true)
        const res = await bulkAddNigerianSubjects(domain)
        if (res.success) toast.success("Added Nigerian standard subjects")
        else toast.error(res.error)
        setLoading(false)
    }

    const openMapping = (subject: any) => {
        setSelectedSubject(subject)
        // In real app, we'd fetch existing mapping for this subject here
        // For now starting empty or pre-filling if we passed mapping data down
        setSelectedClassIds([])
        setMappingModalOpen(true)
    }

    const toggleClass = (id: string) => {
        setSelectedClassIds(prev =>
            prev.includes(id) ? prev.filter(c => c !== id) : [...prev, id]
        )
    }

    const saveMapping = async () => {
        if (!selectedSubject) return
        setLoading(true)
        const res = await updateSubjectMapping(selectedSubject.id, selectedClassIds)
        if (res.success) {
            toast.success("Class mapping updated")
            setMappingModalOpen(false)
        }
        else toast.error(res.error)
        setLoading(false)
    }

    return (
        <Card className="bg-slate-900 border-white/10 h-full flex flex-col">
            <CardHeader className="flex-none">
                <div className="flex items-center justify-between">
                    <div>
                        <CardTitle className="text-white">Subject Manager</CardTitle>
                        <CardDescription className="text-slate-400">Manage subjects and class availability.</CardDescription>
                    </div>
                    <Button variant="outline" size="sm" onClick={handleBulkAdd} disabled={loading}>
                        <Plus className="mr-2 h-4 w-4" /> Bulk Add
                    </Button>
                </div>
                <div className="relative mt-4">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                    <Input
                        placeholder="Search subjects..."
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        className="pl-10 bg-slate-950 border-white/10"
                    />
                </div>
            </CardHeader>
            <CardContent className="flex-1 overflow-auto min-h-[300px]">
                <div className="grid grid-cols-1 gap-2">
                    {filtered.map(subject => (
                        <div key={subject.id} className="flex items-center justify-between p-3 rounded-lg border border-white/5 bg-white/5 hover:bg-white/10 transition-colors">
                            <div className="flex items-center gap-3">
                                <div className="h-8 w-8 rounded-full bg-blue-500/10 flex items-center justify-center text-blue-500">
                                    <BookOpen className="h-4 w-4" />
                                </div>
                                <span className="font-medium text-slate-200">{subject.name}</span>
                            </div>
                            <Button variant="ghost" size="sm" onClick={() => openMapping(subject)} className="text-xs text-slate-400 hover:text-white">
                                Map Classes
                            </Button>
                        </div>
                    ))}
                    {filtered.length === 0 && (
                        <div className="text-center py-8 text-slate-500 text-sm">
                            No subjects found. Try bulk adding.
                        </div>
                    )}
                </div>
            </CardContent>

            <Dialog open={mappingModalOpen} onOpenChange={setMappingModalOpen}>
                <DialogContent className="bg-slate-900 border-white/10 text-white">
                    <DialogHeader>
                        <DialogTitle>Map Classes: {selectedSubject?.name}</DialogTitle>
                        <DialogDescription>Select which classes offer this subject.</DialogDescription>
                    </DialogHeader>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-[300px] overflow-y-auto py-4">
                        {classes.map(cls => {
                            const isSelected = selectedClassIds.includes(cls.id)
                            return (
                                <div
                                    key={cls.id}
                                    onClick={() => toggleClass(cls.id)}
                                    className={`cursor-pointer px-3 py-2 rounded-md border text-sm flex items-center justify-between transition-all ${isSelected
                                            ? "bg-[var(--school-accent)]/20 border-[var(--school-accent)] text-[var(--school-accent)] font-medium"
                                            : "bg-slate-950 border-white/10 text-slate-400 hover:border-white/20"
                                        }`}
                                >
                                    {cls.name}
                                    {isSelected && <Check className="h-3 w-3 ml-2" />}
                                </div>
                            )
                        })}
                    </div>
                    <DialogFooter>
                        <Button variant="ghost" onClick={() => setMappingModalOpen(false)}>Cancel</Button>
                        <Button onClick={saveMapping} disabled={loading} className="bg-[var(--school-accent)]">Save Mapping</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </Card>
    )
}
