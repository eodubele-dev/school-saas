'use client'

import { useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { TransferModal } from '@/components/students/transfer-modal'
import { BulkTransferModal } from '@/components/students/bulk-transfer-modal'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Checkbox } from '@/components/ui/checkbox'
import { ArrowLeftRight, Search, GraduationCap, Users, UserPlus } from 'lucide-react'

interface Student {
    id: string
    name: string
    admissionNo: string
    class: string
    classId?: string
    status: string
    avatar?: string
}

interface ClassOption {
    id: string
    name: string
}

export default function StudentListClient({
    initialStudents,
    classes
}: {
    initialStudents: Student[],
    classes: ClassOption[]
}) {
    const params = useParams()
    const router = useRouter()
    const domain = params.domain as string

    const [searchTerm, setSearchTerm] = useState("")
    const [selectedStudent, setSelectedStudent] = useState<Student | null>(null)
    const [isTransferOpen, setIsTransferOpen] = useState(false)

    // Bulk Selection State
    const [selectedIds, setSelectedIds] = useState<string[]>([])
    const [isBulkOpen, setIsBulkOpen] = useState(false)

    // Filter Logic
    const filteredStudents = initialStudents.filter(s =>
        s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.admissionNo.toLowerCase().includes(searchTerm.toLowerCase())
    )

    const openTransfer = (student: Student) => {
        setSelectedStudent(student)
        setIsTransferOpen(true)
    }

    const toggleSelection = (id: string) => {
        setSelectedIds(prev =>
            prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
        )
    }

    const toggleAll = () => {
        if (selectedIds.length === filteredStudents.length) {
            setSelectedIds([])
        } else {
            setSelectedIds(filteredStudents.map(s => s.id))
        }
    }

    return (
        <div className="space-y-6">
            {/* Header Actions */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div className="relative w-full md:w-96">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Search students by name or ID..."
                        className="pl-10 bg-card text-card-foreground border-border text-foreground"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>

                {selectedIds.length > 0 ? (
                    <div className="flex items-center gap-2 animate-in fade-in slide-in-from-right-10 duration-300">
                        <span className="text-sm text-muted-foreground font-medium mr-2">{selectedIds.length} selected</span>
                        <Button
                            onClick={() => setIsBulkOpen(true)}
                            className="bg-[var(--school-accent)] hover:brightness-110 text-foreground shadow-[0_0_15px_rgba(var(--school-accent-rgb),0.4)]"
                        >
                            <Users className="mr-2 h-4 w-4" />
                            Bulk Promote
                        </Button>
                    </div>
                ) : (
                    <Button
                        onClick={() => router.push(`/${domain}/dashboard/admin/admissions`)}
                        className="bg-[var(--school-accent)] hover:brightness-110 text-foreground shadow-[0_0_15px_rgba(var(--school-accent-rgb),0.4)]"
                    >
                        <UserPlus className="mr-2 h-4 w-4" />
                        New Enrollment
                    </Button>
                )}
            </div>

            {/* Students Table */}
            <div className="border border-border rounded-lg overflow-hidden bg-slate-950/50">
                <Table>
                    <TableHeader className="bg-card text-card-foreground">
                        <TableRow className="border-border/50">
                            <TableHead className="w-[40px] px-4">
                                <Checkbox
                                    checked={filteredStudents.length > 0 && selectedIds.length === filteredStudents.length}
                                    onCheckedChange={toggleAll}
                                    className="border-slate-600 data-[state=checked]:bg-[var(--school-accent)] data-[state=checked]:border-[var(--school-accent)]"
                                />
                            </TableHead>
                            <TableHead className="text-muted-foreground font-bold">Student</TableHead>
                            <TableHead className="text-muted-foreground font-bold">Admission No</TableHead>
                            <TableHead className="text-muted-foreground font-bold">Class</TableHead>
                            <TableHead className="text-muted-foreground font-bold">Status</TableHead>
                            <TableHead className="text-right text-muted-foreground font-bold">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {filteredStudents.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={6} className="h-32 text-center text-muted-foreground">
                                    No students found.
                                </TableCell>
                            </TableRow>
                        ) : (
                            filteredStudents.map((student) => {
                                const isSelected = selectedIds.includes(student.id)
                                return (
                                    <TableRow
                                        key={student.id}
                                        className={`border-border/50 transition-colors group ${isSelected ? 'bg-[var(--school-accent)]/5 hover:bg-[var(--school-accent)]/10' : 'hover:bg-secondary/50'}`}
                                    >
                                        <TableCell className="px-4">
                                            <Checkbox
                                                checked={isSelected}
                                                onCheckedChange={() => toggleSelection(student.id)}
                                                className="border-slate-600 data-[state=checked]:bg-[var(--school-accent)] data-[state=checked]:border-[var(--school-accent)]"
                                            />
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex items-center gap-3">
                                                <div className="h-8 w-8 rounded-full bg-slate-800 flex items-center justify-center overflow-hidden border border-border">
                                                    {student.avatar ? (
                                                        <img src={student.avatar} alt={student.name} className="h-full w-full object-cover" />
                                                    ) : (
                                                        <GraduationCap className="h-4 w-4 text-muted-foreground" />
                                                    )}
                                                </div>
                                                <span className="text-slate-200 font-medium">{student.name}</span>
                                            </div>
                                        </TableCell>
                                        <TableCell className="font-mono text-xs text-muted-foreground">
                                            {student.admissionNo}
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant="outline" className="border-border text-slate-300 bg-card text-card-foreground">
                                                {student.class}
                                            </Badge>
                                        </TableCell>
                                        <TableCell>
                                            <span className={`
                                                inline-flex items-center px-2 py-0.5 rounded textxs font-medium capitalize
                                                ${student.status === 'active' ? 'bg-green-500/10 text-green-400' : 'bg-slate-800 text-muted-foreground'}
                                            `}>
                                                {student.status}
                                            </span>
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <Button
                                                size="sm"
                                                variant="ghost"
                                                onClick={() => openTransfer(student)}
                                                className="h-8 text-[var(--school-accent)] hover:text-[var(--school-accent)] hover:bg-[var(--school-accent)]/10"
                                            >
                                                <ArrowLeftRight className="mr-2 h-3.5 w-3.5" />
                                                Transfer
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                )
                            })
                        )}
                    </TableBody>
                </Table>
            </div>

            <TransferModal
                isOpen={isTransferOpen}
                onClose={() => setIsTransferOpen(false)}
                student={selectedStudent}
                classes={classes}
            />

            <BulkTransferModal
                isOpen={isBulkOpen}
                onClose={() => {
                    setIsBulkOpen(false)
                    setSelectedIds([]) // Optional: clear selection after close or success
                }}
                studentIds={selectedIds}
                classes={classes}
            />
        </div>
    )
}
