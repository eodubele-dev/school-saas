
"use client"

import { useState, useEffect } from "react"
import { getAllQuizzes, deleteQuiz } from "@/lib/actions/cbt-builder"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import {
    Plus,
    MoreVertical,
    Edit2,
    Trash2,
    Rocket,
    Clock,
    Shield,
    BrainCircuit,
    Loader2,
    CheckCircle2,
    FileText
} from "lucide-react"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { toast } from "sonner"

interface QuizListProps {
    classId: string
    subjectId: string
    onEdit: (quizId: string) => void
    onNew: () => void
}

export function QuizList({ classId, subjectId, onEdit, onNew }: QuizListProps) {
    const [quizzes, setQuizzes] = useState<any[]>([])
    const [loading, setLoading] = useState(true)

    const fetchQuizzes = async () => {
        setLoading(true)
        const res = await getAllQuizzes(classId, subjectId)
        if (res.success) setQuizzes(res.data)
        setLoading(false)
    }

    useEffect(() => {
        fetchQuizzes()
    }, [classId, subjectId])

    const handleDelete = async (id: string) => {
        if (!confirm("Are you sure you want to delete this quiz?")) return
        const res = await deleteQuiz(id)
        if (res.success) {
            toast.success("Quiz deleted")
            fetchQuizzes()
        } else {
            toast.error("Failed to delete")
        }
    }

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center h-64 text-slate-500 gap-4">
                <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
                <p>Loading your assessments...</p>
            </div>
        )
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-xl font-bold text-white">Active Assessments</h2>
                    <p className="text-sm text-slate-500">Manage drafts and published quizzes</p>
                </div>
                <Button
                    onClick={onNew}
                    className="bg-blue-600 hover:bg-blue-500 text-white gap-2 font-bold"
                >
                    <Plus className="h-4 w-4" /> New Quiz
                </Button>
            </div>

            {quizzes.length === 0 ? (
                <div className="text-center py-20 bg-slate-900/40 border-2 border-dashed border-white/5 rounded-2xl">
                    <BrainCircuit className="h-12 w-12 text-slate-700 mx-auto mb-4" />
                    <p className="text-slate-400 font-medium">No assessments found for this subject.</p>
                    <p className="text-slate-600 text-sm mt-1">Create your first quiz to get started.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {quizzes.map((quiz) => (
                        <Card key={quiz.id} className="bg-slate-900/60 border-white/5 p-5 hover:border-blue-500/30 transition-all group relative overflow-hidden">
                            <div className={`absolute top-0 right-0 px-3 py-1 text-[10px] font-black uppercase tracking-widest ${quiz.is_active ? 'bg-emerald-500/20 text-emerald-400' : 'bg-orange-500/20 text-orange-400'
                                }`}>
                                {quiz.is_active ? 'Published' : 'Draft'}
                            </div>

                            <div className="space-y-4">
                                <div className="space-y-1">
                                    <h3 className="font-serif font-bold text-lg text-white group-hover:text-blue-400 transition-colors truncate pr-8">
                                        {quiz.title}
                                    </h3>
                                    <p className="text-[10px] text-slate-500 uppercase tracking-widest flex items-center gap-1.5">
                                        <Clock className="h-3 w-3" /> {quiz.duration_minutes} Minutes
                                    </p>
                                </div>

                                <div className="flex items-center gap-4 text-[10px] font-bold text-slate-400 uppercase tracking-tighter">
                                    <span className="bg-slate-950 px-2 py-1 rounded flex items-center gap-1">
                                        <Shield className="h-3 w-3 text-blue-500" /> {quiz.total_questions} Questions
                                    </span>
                                    <span className="bg-slate-950 px-2 py-1 rounded flex items-center gap-1">
                                        <CheckCircle2 className="h-3 w-3 text-emerald-500" /> {quiz.total_marks} Marks
                                    </span>
                                </div>

                                <div className="pt-4 border-t border-white/5 flex items-center justify-between">
                                    <div className="text-[10px] text-slate-600 italic">
                                        Created {new Date(quiz.created_at).toLocaleDateString()}
                                    </div>
                                    <div className="flex items-center gap-1">
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            className="h-8 text-blue-400 hover:bg-blue-400/10 hover:text-blue-400 transition-colors"
                                            onClick={() => onEdit(quiz.id)}
                                        >
                                            <Edit2 className="h-3.5 w-3.5 mr-1" /> Edit
                                        </Button>
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-slate-500">
                                                    <MoreVertical className="h-4 w-4" />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end" className="bg-slate-900 border-white/10 text-white">
                                                <DropdownMenuItem
                                                    onClick={() => handleDelete(quiz.id)}
                                                    className="text-red-400 focus:text-red-400 focus:bg-red-400/10 cursor-pointer"
                                                >
                                                    <Trash2 className="h-4 w-4 mr-2" /> Delete
                                                </DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </div>
                                </div>
                            </div>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    )
}
