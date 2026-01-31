/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
"use client"

import { useState, useEffect } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"
import { Save, Loader2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"

import { upsertGrade, getClassGrades, calculateSubjectPositions } from "@/lib/actions/academic"
import { getClassStudents } from "@/lib/actions/attendance"

interface Student {
    id: string
    full_name: string
}

interface GradeData {
    ca1: number
    ca2: number
    exam: number
    total: number
    grade: string
    position: number
}

interface GradebookEntryProps {
    classId: string
    subjectId: string
    term: string
    session: string
}

export function GradebookEntry({ classId, subjectId, term, session }: GradebookEntryProps) {
    const queryClient = useQueryClient()
    const [localGrades, setLocalGrades] = useState<Record<string, GradeData>>({})

    const queryKey = ['gradebook', classId, subjectId, term, session]

    // 1. Fetch Data with Offline Support
    const { data, isLoading } = useQuery({
        queryKey,
        queryFn: async () => {
            const [studentsRes, gradesRes] = await Promise.all([
                getClassStudents(classId),
                getClassGrades(classId, subjectId, term, session)
            ])

            const students = studentsRes.data || []
            const gradesMap: Record<string, GradeData> = {}
            gradesRes.data?.forEach((g: any) => {
                gradesMap[g.student_id] = {
                    ca1: g.ca1, ca2: g.ca2, exam: g.exam,
                    total: g.total, grade: g.grade, position: g.position
                }
            })

            return { students, gradesMap }
        },
        staleTime: 1000 * 60 * 5, // 5 mins cache
    })

    // Sync local state when data is fresh
    useEffect(() => {
        if (data?.gradesMap) {
            setLocalGrades(prev => ({ ...data.gradesMap, ...prev }))
        }
    }, [data])

    // 2. Mutation with Optimistic Updates
    const mutation = useMutation({
        mutationFn: async (gradesToSave: Record<string, GradeData>) => {
            const promises = Object.entries(gradesToSave).map(([studentId, d]) =>
                upsertGrade({
                    studentId, subjectId, classId, term, session,
                    ca1: d.ca1, ca2: d.ca2, exam: d.exam
                })
            )
            await Promise.all(promises)
            return calculateSubjectPositions(classId, subjectId, term, session)
        },
        onMutate: async (newGrades) => {
            await queryClient.cancelQueries({ queryKey })
            const previousData = queryClient.getQueryData(queryKey)

            // Optimistically update cache
            queryClient.setQueryData(queryKey, (old: any) => ({
                ...old,
                // Merge new grades into existing map
                gradesMap: { ...(old?.gradesMap || {}), ...newGrades }
            }))

            return { previousData }
        },
        onError: (err, newGrades, context) => {
            if (context?.previousData) {
                queryClient.setQueryData(queryKey, context.previousData)
            }
            toast.error("Failed to save changes. Will retry when online.")
        },
        onSuccess: () => {
            // Invalidate to fetch fresh positions/calculated data
            queryClient.invalidateQueries({ queryKey })
            toast.success("Sync Complete!")
        }
    })

    const handleInputChange = (studentId: string, field: 'ca1' | 'ca2' | 'exam', value: string) => {
        const numValue = Math.min(Math.max(Number(value) || 0, 0), field === 'exam' ? 60 : 20)

        setLocalGrades(prev => {
            const current = prev[studentId] || { ca1: 0, ca2: 0, exam: 0, total: 0, grade: '-', position: 0 }
            const updated = { ...current, [field]: numValue }
            // Auto-calc
            updated.total = updated.ca1 + updated.ca2 + updated.exam
            updated.grade = getGrade(updated.total)
            return { ...prev, [studentId]: updated }
        })
    }

    const handleSave = () => {
        mutation.mutate(localGrades)
    }

    if (isLoading) return <div className="flex justify-center p-8"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>

    // Merge local edits with server data for display
    const students = data?.students || []
    const displayGrades = { ...(data?.gradesMap || {}), ...localGrades }

    return (
        <Card className="mt-6 border-none shadow-md">
            <CardHeader className="flex flex-row items-center justify-between">
                <div>
                    <CardTitle>Grade Entry Sheet (Offline-First)</CardTitle>
                    <CardDescription>{session} - {term}</CardDescription>
                </div>
                <Button onClick={handleSave} disabled={mutation.isPending}>
                    {mutation.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                    {mutation.isPending ? "Syncing..." : "Save Changes"}
                </Button>
            </CardHeader>
            <CardContent>
                <div className="rounded-md border">
                    <Table>
                        <TableHeader>
                            <TableRow className="bg-muted/50">
                                <TableHead className="w-[200px]">Student Name</TableHead>
                                <TableHead className="w-[100px] text-center">CA 1 (20)</TableHead>
                                <TableHead className="w-[100px] text-center">CA 2 (20)</TableHead>
                                <TableHead className="w-[100px] text-center">Exam (60)</TableHead>
                                <TableHead className="w-[80px] text-center font-bold">Total</TableHead>
                                <TableHead className="w-[80px] text-center font-bold">Grade</TableHead>
                                <TableHead className="w-[80px] text-center">Pos</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {students.map((student: any) => {
                                const data = displayGrades[student.id] || { ca1: 0, ca2: 0, exam: 0, total: 0, grade: '-', position: 0 }
                                return (
                                    <TableRow key={student.id}>
                                        <TableCell className="font-medium">{student.full_name}</TableCell>
                                        <TableCell>
                                            <Input
                                                type="number"
                                                className="text-center h-8"
                                                value={data.ca1}
                                                onChange={(e) => handleInputChange(student.id, 'ca1', e.target.value)}
                                            />
                                        </TableCell>
                                        <TableCell>
                                            <Input
                                                type="number"
                                                className="text-center h-8"
                                                value={data.ca2}
                                                onChange={(e) => handleInputChange(student.id, 'ca2', e.target.value)}
                                            />
                                        </TableCell>
                                        <TableCell>
                                            <Input
                                                type="number"
                                                className="text-center h-8"
                                                value={data.exam}
                                                onChange={(e) => handleInputChange(student.id, 'exam', e.target.value)}
                                            />
                                        </TableCell>
                                        <TableCell className="text-center font-bold">{data.total}</TableCell>
                                        <TableCell className="text-center font-bold">
                                            <span className={`px-2 py-1 rounded text-xs ${data.grade.startsWith('A') ? 'bg-green-100 text-green-700' :
                                                data.grade.startsWith('F') ? 'bg-red-100 text-red-700' : 'bg-slate-100'
                                                }`}>
                                                {data.grade}
                                            </span>
                                        </TableCell>
                                        <TableCell className="text-center text-muted-foreground">{data.position || '-'}</TableCell>
                                    </TableRow>
                                )
                            })}
                        </TableBody>
                    </Table>
                </div>
            </CardContent>
        </Card>
    )
}

function getGrade(score: number) {
    if (score >= 75) return 'A1'
    if (score >= 70) return 'B2'
    if (score >= 65) return 'B3'
    if (score >= 60) return 'C4'
    if (score >= 55) return 'C5'
    if (score >= 50) return 'C6'
    if (score >= 45) return 'D7'
    if (score >= 40) return 'E8'
    return 'F9'
}
