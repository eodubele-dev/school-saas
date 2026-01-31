/* eslint-disable @typescript-eslint/no-explicit-any */
"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { generateSyllabus } from "@/lib/actions/lesson-plan"
import { toast } from "sonner"
import { BookOpen, Sparkles, Loader2 } from "lucide-react"

export default function LessonPlanPage() {
    const [loading, setLoading] = useState(false)
    const [syllabus, setSyllabus] = useState<Record<string, any>[]>([])

    const handleGenerate = async (formData: FormData) => {
        setLoading(true)
        setSyllabus([])

        const subject = formData.get("subject") as string
        const className = formData.get("className") as string

        try {
            const result = await generateSyllabus(subject, className)
            if (result.success) {
                setSyllabus(result.data)
                toast.success("Syllabus Generated Successfully!")
            } else {
                toast.error("Failed to generate syllabus")
            }
        } catch {
            toast.error("An error occurred")
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="flex-1 space-y-4 p-8 pt-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">AI Lesson Planner</h2>
                    <p className="text-muted-foreground">Generate NERDC-compliant 13-week syllabuses in seconds.</p>
                </div>
            </div>

            <div className="grid gap-4 md:grid-cols-12">
                {/* Input Form */}
                <div className="col-span-12 md:col-span-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>Configuration</CardTitle>
                            <CardDescription>Select class and subject details.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <form action={handleGenerate} className="space-y-4">
                                <div className="space-y-2">
                                    <Label>Class Level</Label>
                                    <Select name="className" required>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select Class" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="JSS 1">JSS 1</SelectItem>
                                            <SelectItem value="JSS 2">JSS 2</SelectItem>
                                            <SelectItem value="JSS 3">JSS 3</SelectItem>
                                            <SelectItem value="SS 1">SS 1</SelectItem>
                                            <SelectItem value="SS 2">SS 2</SelectItem>
                                            <SelectItem value="SS 3">SS 3</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="space-y-2">
                                    <Label>Subject</Label>
                                    <Select name="subject" required>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select Subject" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="Mathematics">Mathematics</SelectItem>
                                            <SelectItem value="English Language">English Language</SelectItem>
                                            <SelectItem value="Basic Science">Basic Science</SelectItem>
                                            <SelectItem value="Civic Education">Civic Education</SelectItem>
                                            <SelectItem value="Economics">Economics</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                                <Button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-700" disabled={loading}>
                                    {loading ? (
                                        <>
                                            <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Generating...
                                        </>
                                    ) : (
                                        <>
                                            <Sparkles className="mr-2 h-4 w-4" /> Generate Plan
                                        </>
                                    )}
                                </Button>
                            </form>
                        </CardContent>
                    </Card>
                </div>

                {/* Results View */}
                <div className="col-span-12 md:col-span-8">
                    {syllabus.length > 0 ? (
                        <Card>
                            <CardHeader>
                                <CardTitle>Generated Syllabus (13 Weeks)</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2">
                                    {syllabus.map((week: Record<string, any>, idx: number) => (
                                        <div key={idx} className="border rounded-lg p-4 hover:bg-slate-50 transition-colors">
                                            <div className="flex items-start gap-3">
                                                <div className="flex items-center justify-center h-8 w-8 rounded-full bg-indigo-100 text-indigo-700 font-bold text-sm shrink-0">
                                                    W{week.week}
                                                </div>
                                                <div className="space-y-2">
                                                    <h4 className="font-semibold text-lg">{week.topic}</h4>

                                                    <div className="grid grid-cols-2 gap-4 text-sm text-muted-foreground">
                                                        <div>
                                                            <strong className="text-foreground">Objectives:</strong>
                                                            <ul className="list-disc list-inside">
                                                                {week.learning_objectives?.map((obj: string, i: number) => (
                                                                    <li key={i}>{obj}</li>
                                                                ))}
                                                            </ul>
                                                        </div>
                                                        <div>
                                                            <strong className="text-foreground">Activities:</strong>
                                                            <ul className="list-disc list-inside">
                                                                {week.activities?.map((act: string, i: number) => (
                                                                    <li key={i}>{act}</li>
                                                                ))}
                                                            </ul>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    ) : (
                        <div className="h-full flex flex-col items-center justify-center p-8 border-2 border-dashed rounded-lg text-center text-muted-foreground min-h-[400px]">
                            <BookOpen className="h-12 w-12 mb-4 opacity-50" />
                            <h3 className="text-lg font-medium">No Lesson Plan Generated Yet</h3>
                            <p>Select a class and subject to create a new NERDC-aligned syllabus.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}
