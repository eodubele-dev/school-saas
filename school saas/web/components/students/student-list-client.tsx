'use client'

import { useState } from 'react'
import { TransferModal } from '@/components/students/transfer-modal'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { ArrowLeftRight, Search, GraduationCap } from 'lucide-react'

// This would typically come from props or a fetch, but for Client Component wrapper pattern
// we will assume data is passed in or we use a separate Client wrapper inside the Page.
// To keep it simple and clean, let's make the Page Server Component fetch data, 
// and a Client Component handle the UI.

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
    const [searchTerm, setSearchTerm] = useState("")
    const [selectedStudent, setSelectedStudent] = useState<Student | null>(null)
    const [isTransferOpen, setIsTransferOpen] = useState(false)

    // Filter Logic
    const filteredStudents = initialStudents.filter(s =>
        s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.admissionNo.toLowerCase().includes(searchTerm.toLowerCase())
    )

    const openTransfer = (student: Student) => {
        setSelectedStudent(student)
        setIsTransferOpen(true)
    }

    return (
        <div className="space-y-6">
            {/* Header Actions */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div className="relative w-full md:w-96">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                    <Input
                        placeholder="Search students by name or ID..."
                        className="pl-10 bg-slate-900 border-white/10 text-white"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                {/* Could add filters here */}
            </div>

            {/* Students Table */}
            <div className="border border-white/10 rounded-lg overflow-hidden bg-slate-950/50">
                <Table>
                    <TableHeader className="bg-slate-900">
                        <TableRow className="border-white/5">
                            <TableHead className="text-slate-400 font-bold">Student</TableHead>
                            <TableHead className="text-slate-400 font-bold">Admission No</TableHead>
                            <TableHead className="text-slate-400 font-bold">Class</TableHead>
                            <TableHead className="text-slate-400 font-bold">Status</TableHead>
                            <TableHead className="text-right text-slate-400 font-bold">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {filteredStudents.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={5} className="h-32 text-center text-slate-500">
                                    No students found.
                                </TableCell>
                            </TableRow>
                        ) : (
                            filteredStudents.map((student) => (
                                <TableRow key={student.id} className="border-white/5 hover:bg-white/5 transition-colors group">
                                    <TableCell>
                                        <div className="flex items-center gap-3">
                                            <div className="h-8 w-8 rounded-full bg-slate-800 flex items-center justify-center overflow-hidden border border-white/10">
                                                {student.avatar ? (
                                                    <img src={student.avatar} alt={student.name} className="h-full w-full object-cover" />
                                                ) : (
                                                    <GraduationCap className="h-4 w-4 text-slate-500" />
                                                )}
                                            </div>
                                            <span className="text-slate-200 font-medium">{student.name}</span>
                                        </div>
                                    </TableCell>
                                    <TableCell className="font-mono text-xs text-slate-400">
                                        {student.admissionNo}
                                    </TableCell>
                                    <TableCell>
                                        <Badge variant="outline" className="border-white/10 text-slate-300 bg-slate-900">
                                            {student.class}
                                        </Badge>
                                    </TableCell>
                                    <TableCell>
                                        <span className={`
                                            inline-flex items-center px-2 py-0.5 rounded textxs font-medium capitalize
                                            ${student.status === 'active' ? 'bg-green-500/10 text-green-400' : 'bg-slate-800 text-slate-400'}
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
                            ))
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
        </div>
    )
}
