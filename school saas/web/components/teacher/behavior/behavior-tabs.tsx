"use client"

import { useState } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { AwardConsole } from "./award-console"
import { IncidentForm } from "./incident-form"
import { StudentEvaluationModal } from "../results/student-evaluation-modal"
import { Sparkles, ClipboardCheck } from "lucide-react"

interface BehaviorTabsProps {
    students: any[]
}

export function BehaviorTabs({ students }: BehaviorTabsProps) {
    const [evalStudent, setEvalStudent] = useState<{ id: string, name: string, classId: string } | null>(null)

    return (
        <div className="space-y-6">
            <Tabs defaultValue="awards" className="space-y-6">
                <TabsList className="bg-slate-900 border border-white/10 p-1">
                    <TabsTrigger value="awards" className="data-[state=active]:bg-[var(--school-accent)] data-[state=active]:text-white text-slate-400">
                        Instant Recognition
                    </TabsTrigger>
                    <TabsTrigger value="incidents" className="data-[state=active]:bg-amber-600 data-[state=active]:text-white text-slate-400">
                        Incident Log
                    </TabsTrigger>
                    <TabsTrigger value="evaluation" className="data-[state=active]:bg-amber-500 data-[state=active]:text-white text-slate-400">
                        <Sparkles className="h-4 w-4 mr-2" /> End of Term Eval
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="awards" className="animate-in fade-in slide-in-from-left-4 duration-300">
                    <AwardConsole students={students} />
                </TabsContent>

                <TabsContent value="incidents" className="animate-in fade-in slide-in-from-left-4 duration-300">
                    <IncidentForm students={students} />
                </TabsContent>

                <TabsContent value="evaluation" className="animate-in fade-in slide-in-from-left-4 duration-300">
                    <div className="bg-card border border-border/50 rounded-xl overflow-hidden">
                        <div className="p-6 border-b border-border/50">
                            <h3 className="text-lg font-bold text-white">End of Term Evaluation</h3>
                            <p className="text-sm text-slate-400">Select a student to launch the comprehensive behavioral evaluation popup.</p>
                        </div>
                        <div className="max-h-[600px] overflow-y-auto">
                            <table className="w-full text-left text-sm">
                                <thead className="bg-slate-900 text-slate-500 font-bold border-b border-border/50 sticky top-0 uppercase tracking-widest text-[10px]">
                                    <tr>
                                        <th className="p-4 px-6">Student Name</th>
                                        <th className="p-4">Admission No.</th>
                                        <th className="p-4 text-right">Action</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-border/30">
                                    {students.map(s => (
                                        <tr key={s.id} className="hover:bg-white/[0.02] transition-colors">
                                            <td className="p-4 px-6 font-bold text-slate-200">{s.full_name}</td>
                                            <td className="p-4 font-mono text-xs text-slate-500">{s.admission_number}</td>
                                            <td className="p-4 text-right">
                                                <Button 
                                                    size="sm" 
                                                    variant="outline"
                                                    onClick={() => setEvalStudent({ id: s.id, name: s.full_name, classId: s.class_id })}
                                                    className="border-amber-500/20 text-amber-500 hover:bg-amber-500 hover:text-white font-bold h-8 px-4 rounded-full transition-all"
                                                >
                                                    <ClipboardCheck className="h-3.5 w-3.5 mr-2" />
                                                    Evaluate
                                                </Button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </TabsContent>
            </Tabs>

            {evalStudent && (
                <StudentEvaluationModal 
                    isOpen={!!evalStudent}
                    onClose={() => setEvalStudent(null)}
                    studentId={evalStudent.id}
                    studentName={evalStudent.name}
                    classId={evalStudent.classId}
                />
            )}
        </div>
    )
}
