"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Plus, Trash2, ArrowRight, User } from "lucide-react"
import { toast } from "sonner"
import { ConfirmModal } from "@/components/modals/confirm-modal"
import { getTeachersForAssignment } from "@/lib/actions/staff"
import {
    assignFormTeacher,
    createClassLevel,
    createClass,
    deleteClassLevel,
    deleteClass
} from "@/lib/actions/classes"

interface ClassLevel {
    id: string
    name: string
    section: 'Junior' | 'Senior' | 'Primary' | 'Nursery'
}

interface Arm {
    id: string
    name: string // e.g., "Gold"
    class_level_id: string
    form_teacher_id: string | null
    capacity: number
}

interface Teacher {
    id: string
    full_name: string
}

export function ClassesArmsStep({ onNext }: { onNext: () => void }) {
    const [levels, setLevels] = useState<ClassLevel[]>([])
    const [arms, setArms] = useState<Arm[]>([])
    const [teachers, setTeachers] = useState<Teacher[]>([])
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const [tenantId, setTenantId] = useState<string | null>(null)
    const supabase = createClient()

    // Dialog States
    const [isAddLevelOpen, setIsAddLevelOpen] = useState(false)
    const [newLevelName, setNewLevelName] = useState("")
    const [newLevelSection, setNewLevelSection] = useState<'Junior' | 'Senior' | 'Primary' | 'Nursery'>('Junior')

    const [isAddArmOpen, setIsAddArmOpen] = useState(false)
    const [activeLevelId, setActiveLevelId] = useState<string | null>(null)
    const [newArmName, setNewArmName] = useState("")

    const [confirmConfig, setConfirmConfig] = useState<{ isOpen: boolean, title: string, description: string, onConfirm: () => void }>({
        isOpen: false,
        title: "",
        description: "",
        onConfirm: () => { }
    })

    const closeConfirm = () => setConfirmConfig({ ...confirmConfig, isOpen: false })

    useEffect(() => {
        fetchData()
    }, [])

    const fetchData = async () => {
        try {
            setLoading(true)

            // Get current user tenant
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) return

            const { data: profile } = await supabase.from('profiles').select('tenant_id').eq('id', user.id).single()
            if (profile) setTenantId(profile.tenant_id)
            else {
                toast.error("User profile not found")
                return
            }

            const [levelsRes, armsRes, teachersRes] = await Promise.all([
                supabase.from('class_levels').select('*').order('name'),
                supabase.from('classes').select('*, class_levels(name)').order('name'),
                getTeachersForAssignment()
            ])

            if (levelsRes.data) setLevels(levelsRes.data)
            if (armsRes.data) setArms(armsRes.data)
            if (teachersRes.success && teachersRes.data) setTeachers(teachersRes.data)
        } catch (error) {
            console.error(error)
            toast.error("Failed to load data")
        } finally {
            setLoading(false)
        }
    }

    const addLevel = async () => {
        if (!newLevelName) return

        const res = await createClassLevel({ name: newLevelName, section: newLevelSection })

        if (res.success && res.data) {
            setLevels([...levels, res.data])
            toast.success("Level Added")
            setIsAddLevelOpen(false)
            setNewLevelName("")
        } else {
            toast.error(res.error || "Failed to add level")
        }
    }

    const deleteLevel = async (id: string) => {
        const hasArms = arms.some(a => a.class_level_id === id)

        const proceedDelete = async () => {
            const res = await deleteClassLevel(id)
            if (res.success) {
                setLevels(levels.filter(l => l.id !== id))
                setArms(arms.filter(a => a.class_level_id !== id))
                toast.success("Level Deleted")
            } else {
                toast.error(res.error || "Failed to delete level")
            }
        }

        setConfirmConfig({
            isOpen: true,
            title: "Delete Level?",
            description: hasArms
                ? "This level has arms attached. Deleting it will delete all arms and enrolled students. This action cannot be undone."
                : "Are you sure you want to delete this class level?",
            onConfirm: proceedDelete
        })
    }

    const openAddArm = (levelId: string) => {
        setActiveLevelId(levelId)
        setIsAddArmOpen(true)
    }

    const addArm = async () => {
        if (!newArmName || !activeLevelId) return

        const level = levels.find(l => l.id === activeLevelId)
        const constructedName = `${level?.name} ${newArmName}`

        const res = await createClass({
            name: constructedName,
            grade_level: level?.name || "",
            class_level_id: activeLevelId
        })

        if (res.success && res.data) {
            setArms([...arms, res.data])
            toast.success("Arm Added")
            setIsAddArmOpen(false)
            setNewArmName("")
        } else {
            toast.error(res.error || "Failed to add arm")
        }
    }

    const updateArmTeacher = async (armId: string, teacherId: string) => {
        const res = await assignFormTeacher(armId, teacherId || null)

        if (res.success) {
            setArms(arms.map(a => a.id === armId ? { ...a, form_teacher_id: teacherId } : a))
            toast.success("Form Teacher Updated")
        } else {
            toast.error(res.error || "Failed to update form teacher")
        }
    }

    // Group Arms by Level
    const armsByLevel = (levelId: string) => arms.filter(a => a.class_level_id === levelId)

    if (loading) return <div>Loading...</div>

    return (
        <div className="space-y-8">
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-xl font-bold text-white">Class & Arm Manager</h2>
                    <p className="text-slate-400">Define your school structure. Levels (e.g. JSS 1) contain Arms (e.g. JSS 1A).</p>
                </div>
                <Button onClick={() => setIsAddLevelOpen(true)} className="bg-[var(--school-accent)] text-white">
                    <Plus className="mr-2 h-4 w-4" /> Add Level
                </Button>
            </div>

            <div className="grid grid-cols-1 gap-6">
                {levels.length === 0 && (
                    <div className="p-12 text-center border-2 border-dashed border-white/10 rounded-xl">
                        <p className="text-slate-500">No classes defined yet. Click "Add Level" to start.</p>
                    </div>
                )}

                {levels.map(level => (
                    <Card key={level.id} className="bg-slate-900 border-white/10">
                        <CardHeader className="pb-2">
                            <div className="flex justify-between items-center">
                                <CardTitle className="text-white text-lg flex items-center gap-2">
                                    {level.name}
                                    <span className="text-xs px-2 py-0.5 rounded-full bg-white/10 text-slate-300 font-normal ml-2">{level.section}</span>
                                </CardTitle>
                                <div className="flex items-center gap-2">
                                    <Button size="sm" variant="outline" onClick={() => openAddArm(level.id)} className="border-white/20 bg-transparent hover:bg-white/10 hover:text-white text-slate-300 transition-colors">
                                        <Plus className="mr-1 h-3 w-3" /> Add Arm
                                    </Button>
                                    <Button size="icon" variant="ghost" onClick={() => deleteLevel(level.id)} className="text-red-400 hover:bg-red-500/10">
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-3">
                                {armsByLevel(level.id).length === 0 ? (
                                    <p className="text-sm text-slate-500 italic">No arms added yet.</p>
                                ) : (
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                                        {armsByLevel(level.id).map(arm => (
                                            <div key={arm.id} className="p-3 rounded bg-slate-950 border border-white/5 flex flex-col gap-3">
                                                <div className="flex justify-between items-start">
                                                    <span className="font-medium text-white">{arm.name}</span>
                                                    <Button size="icon" variant="ghost" className="h-6 w-6 text-red-500/50 hover:text-red-500" onClick={() => {
                                                        setConfirmConfig({
                                                            isOpen: true,
                                                            title: "Delete Arm?",
                                                            description: `Are you sure you want to delete ${arm.name}?`,
                                                            onConfirm: async () => {
                                                                const res = await deleteClass(arm.id)
                                                                if (res.success) {
                                                                    setArms(arms.filter(a => a.id !== arm.id))
                                                                    toast.success("Arm Deleted")
                                                                } else {
                                                                    toast.error(res.error || "Failed to delete arm")
                                                                }
                                                            }
                                                        })
                                                    }}>
                                                        <Trash2 className="h-3 w-3" />
                                                    </Button>
                                                </div>

                                                <div className="space-y-1">
                                                    <Label className="text-xs text-slate-500">Form Teacher</Label>
                                                    <Select
                                                        value={arm.form_teacher_id || "unassigned"}
                                                        onValueChange={(val) => updateArmTeacher(arm.id, val === "unassigned" ? "" : val)}
                                                    >
                                                        <SelectTrigger className="h-8 text-xs bg-slate-900 border-white/10 text-slate-300">
                                                            <SelectValue placeholder="Assign Teacher" />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            <SelectItem value="unassigned">Unassigned</SelectItem>
                                                            {teachers.map(t => (
                                                                <SelectItem key={t.id} value={t.id}>{t.full_name}</SelectItem>
                                                            ))}
                                                        </SelectContent>
                                                    </Select>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            <div className="flex justify-end pt-8">
                <Button onClick={onNext} className="bg-[var(--school-accent)] text-white px-8">
                    Proceed to Subject Registry <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
            </div>

            {/* Add Level Dialog */}
            {isAddLevelOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
                    <div className="w-full max-w-md bg-slate-900 border border-white/10 rounded-xl p-6 shadow-xl space-y-4 m-4">
                        <h3 className="text-lg font-bold text-white">Add New Level</h3>
                        <div className="space-y-4">
                            <div className="space-y-2">
                                <Label className="text-slate-400">Level Name (e.g. JSS 1)</Label>
                                <Input
                                    value={newLevelName}
                                    onChange={e => setNewLevelName(e.target.value)}
                                    placeholder="Enter level name"
                                    className="bg-slate-950 border-white/10 text-white"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label className="text-slate-400">Section</Label>
                                <Select value={newLevelSection} onValueChange={(val: any) => setNewLevelSection(val)}>
                                    <SelectTrigger className="bg-slate-950 border-white/10 text-white">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="Junior">Junior Secondary</SelectItem>
                                        <SelectItem value="Senior">Senior Secondary</SelectItem>
                                        <SelectItem value="Primary">Primary</SelectItem>
                                        <SelectItem value="Nursery">Nursery</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                        <div className="flex justify-end gap-3 pt-2">
                            <Button variant="ghost" onClick={() => setIsAddLevelOpen(false)} className="text-slate-400">Cancel</Button>
                            <Button onClick={addLevel} className="bg-[var(--school-accent)] text-white">Create Level</Button>
                        </div>
                    </div>
                </div>
            )}

            {/* Add Arm Dialog */}
            {isAddArmOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
                    <div className="w-full max-w-sm bg-slate-900 border border-white/10 rounded-xl p-6 shadow-xl space-y-4 m-4">
                        <h3 className="text-lg font-bold text-white">Add New Arm</h3>
                        <div className="space-y-2">
                            <Label className="text-slate-400">Arm Name (e.g. Gold, A)</Label>
                            <Input
                                value={newArmName}
                                onChange={e => setNewArmName(e.target.value)}
                                placeholder="Enter arm suffix"
                                className="bg-slate-950 border-white/10 text-white"
                            />
                        </div>
                        <div className="flex justify-end gap-3 pt-2">
                            <Button variant="ghost" onClick={() => setIsAddArmOpen(false)} className="text-slate-400">Cancel</Button>
                            <Button onClick={addArm} className="bg-[var(--school-accent)] text-white">Create Arm</Button>
                        </div>
                    </div>
                </div>
            )}

            <ConfirmModal
                isOpen={confirmConfig.isOpen}
                onClose={closeConfirm}
                onConfirm={confirmConfig.onConfirm}
                title={confirmConfig.title}
                description={confirmConfig.description}
                variant="destructive"
                confirmText="Delete"
            />
        </div>
    )
}
