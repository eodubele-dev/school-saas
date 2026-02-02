"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent } from "@/components/ui/card"
import { ArrowLeft, ArrowRight, Download, BookOpen, User, Plus, X } from "lucide-react"
import { toast } from "sonner"
import { ConfirmModal } from "@/components/modals/confirm-modal"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
// Unused import removed

// Placeholder NERDC Data
const NERDC_JUNIOR = ["Mathematics", "English Language", "Basic Science", "Basic Technology", "Civic Education", "Social Studies", "Agricultural Science", "Business Studies", "Home Economics", "Computer Studies"]
const NERDC_SENIOR = ["Mathematics", "English Language", "Biology", "Physics", "Chemistry", "Economics", "Government", "Literature-in-English", "Geography", "Further Mathematics"]

export function SubjectRegistryStep({ onNext, onPrev }: { onNext: () => void, onPrev: () => void }) {
    const [subjects, setSubjects] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [importing, setImporting] = useState(false)
    const [tenantId, setTenantId] = useState<string | null>(null)
    const supabase = createClient()

    // Modal States
    const [isAddSubjectOpen, setIsAddSubjectOpen] = useState(false)
    const [newSubjectName, setNewSubjectName] = useState("")
    const [newSubjectCategory, setNewSubjectCategory] = useState("Universal")

    const [confirmConfig, setConfirmConfig] = useState<{ isOpen: boolean, title: string, description: string, onConfirm: () => void }>({
        isOpen: false,
        title: "",
        description: "",
        onConfirm: () => { }
    })
    const closeConfirm = () => setConfirmConfig({ ...confirmConfig, isOpen: false })

    useEffect(() => {
        fetchSubjects()
    }, [])

    const fetchSubjects = async () => {
        setLoading(true)
        try {
            // Get current user tenant
            if (!tenantId) {
                const { data: { user } } = await supabase.auth.getUser()
                if (user) {
                    const { data: profile } = await supabase.from('profiles').select('tenant_id').eq('id', user.id).single()
                    if (profile) setTenantId(profile.tenant_id)
                }
            }

            const { data } = await supabase.from('subjects').select('*').order('name')
            if (data) setSubjects(data)
        } catch (e) {
            console.error(e)
            toast.error("Failed to load subjects")
        } finally {
            setLoading(false)
        }
    }

    const importNERDC = async () => {
        if (!tenantId) {
            toast.error("Tenant ID not found. Please refresh.")
            return
        }

        setConfirmConfig({
            isOpen: true,
            title: "Import NERDC Subjects?",
            description: "This will bulk import Standard Nigerian Subjects into your registry. Existing subjects with same names will be skipped.",
            onConfirm: async () => {
                setImporting(true)
                const allSubjects = [
                    ...NERDC_JUNIOR.map(s => ({ name: s, category: 'Junior', code: s.substring(0, 3).toUpperCase(), tenant_id: tenantId })),
                    ...NERDC_SENIOR.map(s => ({ name: s, category: 'Senior', code: s.substring(0, 3).toUpperCase(), tenant_id: tenantId }))
                ]

                let count = 0
                for (const sub of allSubjects) {
                    const exists = subjects.find(s => s.name === sub.name && s.category === sub.category)
                    if (!exists) {
                        await supabase.from('subjects').insert(sub)
                        count++
                    }
                }

                await fetchSubjects()
                setImporting(false)
                toast.success(`Imported ${count} new subjects from NERDC curriculum`)
            }
        })
    }

    const openAddSubject = () => {
        setNewSubjectName("")
        setNewSubjectCategory("Universal")
        setIsAddSubjectOpen(true)
    }

    const addSubject = async () => {
        if (!tenantId) {
            toast.error("Tenant ID not found")
            return
        }
        if (!newSubjectName) return

        const { error } = await supabase.from('subjects').insert({
            name: newSubjectName,
            category: newSubjectCategory,
            code: newSubjectName.substring(0, 3).toUpperCase(),
            tenant_id: tenantId
        })

        if (!error) {
            fetchSubjects()
            toast.success("Subject Added")
            setIsAddSubjectOpen(false)
        } else {
            toast.error("Failed to add subject: " + error.message)
        }
    }

    const deleteSubject = async (id: string) => {
        setConfirmConfig({
            isOpen: true,
            title: "Delete Subject?",
            description: "Are you sure you want to remove this subject?",
            onConfirm: async () => {
                const { error } = await supabase.from('subjects').delete().eq('id', id)
                if (!error) {
                    setSubjects(subjects.filter(s => s.id !== id))
                    toast.success("Subject Deleted")
                }
            }
        })
    }

    return (
        <div className="space-y-8">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h2 className="text-xl font-bold text-white">Subject Registry</h2>
                    <p className="text-slate-400">Manage all subjects taught in the school.</p>
                </div>
                <div className="flex gap-3">
                    <Button onClick={openAddSubject} variant="outline" className="border-white/20 bg-transparent hover:bg-white/10 hover:text-white text-slate-300 transition-colors">
                        <Plus className="mr-2 h-4 w-4" /> Add Custom
                    </Button>
                    <Button
                        onClick={importNERDC}
                        disabled={importing}
                        className="bg-[var(--school-accent)] text-white shadow-[0_0_20px_rgba(37,99,235,0.3)] hover:shadow-[0_0_30px_rgba(37,99,235,0.5)] transition-all duration-300"
                    >
                        <Download className="mr-2 h-4 w-4" /> Import NERDC Standard
                    </Button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Junior Subjects */}
                <SubjectList
                    title="Junior Secondary"
                    subjects={subjects.filter(s => s.category === 'Junior' || s.category === 'Universal')}
                    onDelete={deleteSubject}
                />
                {/* Senior Subjects */}
                <SubjectList
                    title="Senior Secondary"
                    subjects={subjects.filter(s => s.category === 'Senior' || s.category === 'Universal')}
                    onDelete={deleteSubject}
                />
            </div>

            {/* Teacher Assignment Hint */}
            <div className="bg-blue-500/5 border border-blue-500/20 p-4 rounded-lg flex items-start gap-3">
                <BookOpen className="h-5 w-5 text-blue-400 mt-0.5" />
                <div>
                    <h4 className="text-blue-400 font-medium">Teacher Assignment</h4>
                    <p className="text-sm text-slate-400">
                        To assign teachers to subjects for specific classes, please go to the
                        <span className="font-bold text-slate-300"> "Staff & Roles"</span> module after setup.
                        Currently this wizard focuses on defining the global subject list.
                    </p>
                </div>
            </div>

            <div className="flex justify-between pt-8">
                <Button variant="ghost" onClick={onPrev} className="text-slate-400 hover:text-white hover:bg-white/5">
                    <ArrowLeft className="mr-2 h-4 w-4" /> Back
                </Button>
                <Button onClick={onNext} className="bg-[var(--school-accent)] text-white px-8">
                    Proceed to Grading Config <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
            </div>

            {/* Add Subject Dialog */}
            <Dialog open={isAddSubjectOpen} onOpenChange={setIsAddSubjectOpen}>
                <DialogContent className="bg-slate-900 border-white/10 text-white">
                    <DialogHeader>
                        <DialogTitle>Add Custom Subject</DialogTitle>
                        <DialogDescription className="text-slate-400">Add a new subject that isn't in the standard list.</DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-2">
                        <div className="space-y-2">
                            <Label>Subject Name</Label>
                            <Input
                                value={newSubjectName}
                                onChange={e => setNewSubjectName(e.target.value)}
                                placeholder="e.g. Photography"
                                className="bg-slate-950 border-white/10"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>Category</Label>
                            <Select value={newSubjectCategory} onValueChange={setNewSubjectCategory}>
                                <SelectTrigger className="bg-slate-950 border-white/10">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="Universal">Universal (All Classes)</SelectItem>
                                    <SelectItem value="Junior">Junior Secondary Only</SelectItem>
                                    <SelectItem value="Senior">Senior Secondary Only</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="ghost" onClick={() => setIsAddSubjectOpen(false)} className="text-slate-400">Cancel</Button>
                        <Button onClick={addSubject} className="bg-[var(--school-accent)] text-white">Add Subject</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            <ConfirmModal
                isOpen={confirmConfig.isOpen}
                onClose={closeConfirm}
                onConfirm={confirmConfig.onConfirm}
                title={confirmConfig.title}
                description={confirmConfig.description}
                variant={confirmConfig.title.includes("Delete") ? "destructive" : "default"}
                confirmText={confirmConfig.title.includes("Delete") ? "Delete" : "Confirm"}
            />
        </div>
    )
}

function SubjectList({ title, subjects, onDelete }: { title: string, subjects: any[], onDelete: (id: string) => void }) {
    return (
        <Card className="bg-slate-900 border-white/10 h-full">
            <CardContent className="p-6">
                <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                    {title} <span className="text-xs bg-slate-800 text-slate-400 px-2 py-0.5 rounded-full">{subjects.length}</span>
                </h3>
                <div className="space-y-2 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                    {subjects.length === 0 ? (
                        <p className="text-slate-500 text-sm italic">No subjects found.</p>
                    ) : (
                        subjects.map(sub => (
                            <div key={sub.id} className="flex justify-between items-center p-3 rounded bg-slate-950 border border-white/5 hover:border-white/10 transition-colors group">
                                <div className="flex items-center gap-3">
                                    <div className="h-8 w-8 rounded bg-[var(--school-accent)]/10 text-[var(--school-accent)] flex items-center justify-center font-bold text-xs">
                                        {sub.code || sub.name.substring(0, 2).toUpperCase()}
                                    </div>
                                    <span className="text-sm font-medium text-slate-300">{sub.name}</span>
                                </div>
                                <Button size="icon" variant="ghost" onClick={() => onDelete(sub.id)} className="h-6 w-6 text-slate-600 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <X className="h-3 w-3" />
                                </Button>
                            </div>
                        ))
                    )}
                </div>
            </CardContent>
        </Card>
    )
}
