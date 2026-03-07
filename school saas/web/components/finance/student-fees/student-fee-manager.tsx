"use client"

import { useState, useEffect } from "react"
import { Users, Search, Save, CheckCircle2, ShieldAlert } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { getStudentFeeOverrides, toggleFeeOverride } from "@/lib/actions/finance"
import { toast } from "sonner"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"

export function StudentFeeManager({ domain, classes }: { domain: string, classes: any[] }) {
    const [students, setStudents] = useState<any[]>([])
    const [categories, setCategories] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [selectedClass, setSelectedClass] = useState<string>("all")
    const [searchQuery, setSearchQuery] = useState("")

    const [selectedStudent, setSelectedStudent] = useState<any | null>(null)
    const [isSaving, setIsSaving] = useState(false)

    const fetchOverrides = async () => {
        setLoading(true)
        const res = await getStudentFeeOverrides(selectedClass)
        if (res.success) {
            setStudents(res.students || [])
            setCategories(res.categories || [])
        } else {
            toast.error(res.error)
        }
        setLoading(false)
    }

    const [currentPage, setCurrentPage] = useState(1)
    const itemsPerPage = 8

    useEffect(() => {
        fetchOverrides()
    }, [selectedClass])

    useEffect(() => {
        setCurrentPage(1)
    }, [searchQuery, selectedClass])

    const filteredStudents = students.filter(s =>
        s.full_name?.toLowerCase().includes(searchQuery.toLowerCase())
    )

    const totalPages = Math.max(1, Math.ceil(filteredStudents.length / itemsPerPage))
    const currentStudents = filteredStudents.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)

    const handleToggle = async (studentId: string, categoryId: string, isCurrentlyActive: boolean, isMandatory: boolean) => {
        setIsSaving(true)
        // If it's mandatory, toggling it "off" means adding an EXEMPTION.
        // If it's optional, toggling it "on" means adding an ADDON.

        let targetState: boolean;
        let type: 'addon' | 'exemption';

        if (isMandatory) {
            type = 'exemption'
            targetState = isCurrentlyActive // If they *are* active (have the fee), we want to turn it off (create exemption = true).
            // Wait, let's look at the UI state. 
            // UI Toggle represents "Is the student paying this fee?".
            // Optional fee: UI OFF -> UI ON (currently active = false -> true). Creates ADDON.
            // Mandatory fee: UI ON -> UI OFF (currently active = true -> false). Creates EXEMPTION.
        } else {
            type = 'addon'
        }

        // Logic check:
        // isCurrentlyActive = what the toggle represents before clicking.
        if (isMandatory) {
            // It's mandatory. Default is THEY PAY IT.
            // If they are paying it, `isCurrentlyActive` is TRUE.
            // We want them to NOT pay it. So we must set an EXEMPTION to TRUE.
            targetState = isCurrentlyActive ? true : false;
        } else {
            // It's optional. Default is THEY DON'T PAY IT.
            // If they are not paying it, `isCurrentlyActive` is FALSE.
            // We want them to PAY it. So we must set an ADDON to TRUE.
            targetState = isCurrentlyActive ? false : true;
        }

        const res = await toggleFeeOverride(studentId, categoryId, type, targetState)

        if (res.success) {
            toast.success("Billing config updated!")
            // Optimistic local update
            const updatedStudents = students.map(s => {
                if (s.id === studentId) {
                    if (isMandatory) {
                        if (targetState) {
                            s.exemptions.push({ category_id: categoryId })
                        } else {
                            s.exemptions = s.exemptions.filter((e: any) => e.category_id !== categoryId)
                        }
                    } else {
                        if (targetState) {
                            s.addons.push({ category_id: categoryId })
                        } else {
                            s.addons = s.addons.filter((a: any) => a.category_id !== categoryId)
                        }
                    }
                }
                return s
            })
            setStudents(updatedStudents)

            // Also update the selectedStudent reference to reflect immediately in the modal
            if (selectedStudent && selectedStudent.id === studentId) {
                setSelectedStudent(updatedStudents.find(s => s.id === studentId))
            }
        } else {
            toast.error("Failed to update config")
        }
        setIsSaving(false)
    }

    return (
        <Card className="bg-gradient-to-br from-slate-900 via-slate-900 to-slate-950 border-white/10 relative overflow-hidden shadow-2xl min-h-[600px]">
            {/* Header */}
            <CardHeader className="flex flex-row items-center justify-between pb-6 border-b border-white/5 bg-slate-900/50 backdrop-blur-xl z-30">
                <div>
                    <CardTitle className="text-white text-xl flex items-center gap-2">
                        <div className="h-8 w-8 rounded-lg bg-orange-500/20 flex items-center justify-center border border-orange-500/30">
                            <Users className="h-4 w-4 text-orange-400" />
                        </div>
                        Student Fee Exemptions & Add-ons
                    </CardTitle>
                    <CardDescription className="text-slate-400 mt-1">Override specific mandatory or optional billing items per student.</CardDescription>
                </div>

                <div className="flex gap-4">
                    <Select value={selectedClass} onValueChange={setSelectedClass}>
                        <SelectTrigger className="w-[180px] bg-slate-950 border-white/10 text-white">
                            <SelectValue placeholder="All Classes" />
                        </SelectTrigger>
                        <SelectContent className="bg-slate-950 border-white/10 text-white">
                            <SelectItem value="all">All Classes</SelectItem>
                            {classes.map(c => (
                                <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                    <div className="relative w-64">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                        <Input
                            placeholder="Search student..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="bg-slate-950/50 border-white/10 text-white pl-9 placeholder:text-slate-600 focus:border-orange-500"
                        />
                    </div>
                </div>
            </CardHeader>

            {/* Content Table */}
            <CardContent className="p-0 flex flex-col justify-between min-h-[650px]">
                <div className="flex-1">
                    <Table>
                        <TableHeader className="bg-slate-950/80 backdrop-blur-md sticky top-0 z-20">
                            <TableRow className="border-b border-white/10 hover:bg-transparent">
                                <TableHead className="text-white font-bold pl-6">Student Name</TableHead>
                                <TableHead className="text-slate-300">Class</TableHead>
                                <TableHead className="text-slate-300 text-center">Active Add-ons</TableHead>
                                <TableHead className="text-slate-300 text-center">Active Exemptions</TableHead>
                                <TableHead className="text-right pr-6">Action</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {loading ? (
                                <TableRow>
                                    <TableCell colSpan={5} className="text-center py-20 text-slate-500">Loading student directory...</TableCell>
                                </TableRow>
                            ) : filteredStudents.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={5} className="text-center py-20 text-slate-500">No students found.</TableCell>
                                </TableRow>
                            ) : (
                                currentStudents.map(student => (
                                    <TableRow key={student.id} className="border-white/5 hover:bg-white/[0.02] cursor-pointer" onClick={() => setSelectedStudent(student)}>
                                        <TableCell className="font-semibold text-slate-200 pl-6 flex items-center gap-2 pt-4">
                                            {student.full_name}
                                            {student.has_sibling_waiver && (
                                                <span className="text-[9px] uppercase tracking-wider bg-emerald-500/10 text-emerald-400 px-1.5 py-0.5 rounded border border-emerald-500/20" title="Automated Family Discount Applied">
                                                    Sibling Waiver
                                                </span>
                                            )}
                                        </TableCell>
                                        <TableCell className="text-slate-400">{student.class?.name || 'Unassigned'}</TableCell>
                                        <TableCell className="text-center">
                                            {student.addons?.length > 0
                                                ? <span className="bg-emerald-500/10 text-emerald-400 px-2 py-1 rounded-full text-xs border border-emerald-500/20">{student.addons.length} Add-on{student.addons.length > 1 ? 's' : ''}</span>
                                                : <span className="text-slate-600">-</span>
                                            }
                                        </TableCell>
                                        <TableCell className="text-center">
                                            {student.exemptions?.length > 0
                                                ? <span className="bg-rose-500/10 text-rose-400 px-2 py-1 rounded-full text-xs border border-rose-500/20">{student.exemptions.length} Waived</span>
                                                : <span className="text-slate-600">-</span>
                                            }
                                        </TableCell>
                                        <TableCell className="text-right pr-6">
                                            <Button variant="outline" size="sm" className="bg-white/5 border-white/10 hover:bg-orange-500/20 hover:text-orange-400 hover:border-orange-500/30 text-slate-300">
                                                Configure
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </div>
                {totalPages > 1 && (
                    <div className="flex items-center justify-between px-6 py-4 bg-slate-950/80 backdrop-blur-md border-t border-white/10 mt-auto">
                        <div className="text-sm text-slate-400">
                            Showing {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, filteredStudents.length)} of {filteredStudents.length} students
                        </div>
                        <div className="flex gap-2">
                            <Button
                                variant="outline"
                                type="button"
                                size="sm"
                                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                                disabled={currentPage === 1}
                                className="bg-slate-900 border-white/10 text-slate-300 hover:bg-slate-800 hover:text-white"
                            >
                                Previous
                            </Button>
                            <Button
                                variant="outline"
                                type="button"
                                size="sm"
                                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                                disabled={currentPage === totalPages}
                                className="bg-slate-900 border-white/10 text-slate-300 hover:bg-slate-800 hover:text-white"
                            >
                                Next
                            </Button>
                        </div>
                    </div>
                )}
            </CardContent>

            {/* Assignment Modal */}
            <Dialog open={!!selectedStudent} onOpenChange={(open) => !open && setSelectedStudent(null)}>
                <DialogContent className="bg-slate-950 border-white/10 max-w-2xl">
                    <DialogHeader>
                        <DialogTitle className="text-xl text-white">Billing Configuration Configuration</DialogTitle>
                        <DialogDescription className="text-slate-400 flex items-center gap-2 pt-2 pb-4">
                            <span className="font-bold text-slate-200">{selectedStudent?.full_name}</span>
                            <span className="text-slate-600">•</span>
                            <span className="text-orange-400">{selectedStudent?.class?.name}</span>
                        </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-6">
                        {/* Mandatory Fees (Exemption Zone) */}
                        <div className="space-y-3">
                            <h3 className="text-xs font-bold uppercase tracking-wider text-rose-400 flex items-center gap-2">
                                <ShieldAlert className="h-4 w-4" /> Core Fees (Mandatory)
                            </h3>
                            <div className="grid grid-cols-2 gap-3">
                                {categories.filter(c => c.is_mandatory).map(cat => {
                                    const isExempt = selectedStudent?.exemptions?.some((e: any) => e.category_id === cat.id)
                                    // Being billed = true if NOT exempt
                                    const isBilled = !isExempt

                                    return (
                                        <div key={cat.id} className="flex items-center justify-between p-3 rounded-lg border border-white/10 bg-slate-900/50">
                                            <div>
                                                <p className="text-sm font-medium text-slate-200">{cat.name}</p>
                                                <p className="text-[10px] text-slate-500">{isBilled ? "Currently Billed" : "Waived (Exempt)"}</p>
                                            </div>
                                            <Switch
                                                checked={isBilled}
                                                disabled={isSaving}
                                                onCheckedChange={() => handleToggle(selectedStudent.id, cat.id, isBilled, true)}
                                                className="data-[state=checked]:bg-emerald-500 data-[state=unchecked]:bg-rose-500/50"
                                            />
                                        </div>
                                    )
                                })}
                            </div>
                        </div>

                        {/* Optional Fees (Addon Zone) */}
                        <div className="space-y-3 pt-4 border-t border-white/5">
                            <h3 className="text-xs font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-2">
                                <CheckCircle2 className="h-4 w-4" /> Optional Fees (Add-ons)
                            </h3>
                            <div className="grid grid-cols-2 gap-3">
                                {categories.filter(c => !c.is_mandatory).map(cat => {
                                    const isAddon = selectedStudent?.addons?.some((a: any) => a.category_id === cat.id)

                                    return (
                                        <div key={cat.id} className="flex items-center justify-between p-3 rounded-lg border border-white/10 bg-slate-900/50">
                                            <div>
                                                <p className="text-sm font-medium text-slate-200">{cat.name}</p>
                                                <p className="text-[10px] text-slate-500">{isAddon ? "Opted In" : "Not Billed"}</p>
                                            </div>
                                            <Switch
                                                checked={isAddon}
                                                disabled={isSaving}
                                                onCheckedChange={() => handleToggle(selectedStudent.id, cat.id, isAddon, false)}
                                                className="data-[state=checked]:bg-emerald-500 data-[state=unchecked]:bg-slate-700"
                                            />
                                        </div>
                                    )
                                })}
                            </div>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
        </Card>
    )
}
