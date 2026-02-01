"use client"

import { Card } from "@/components/ui/card"
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'
import { Button } from "@/components/ui/button"
import { ArrowRight, BrainCircuit } from "lucide-react"

export function ExamReadiness({ history }: { history: any[] }) {
    return (
        <Card className="p-6 bg-slate-900 border-white/5 relative overflow-hidden">

            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 z-10 relative">
                <div>
                    <h3 className="text-white font-bold text-lg flex items-center gap-2">
                        <BrainCircuit className="h-5 w-5 text-amber-500" />
                        JAMB/WAEC Readiness
                    </h3>
                    <p className="text-sm text-slate-400">Your practice test performance trend.</p>
                </div>
                <Button size="sm" className="bg-amber-600 hover:bg-amber-700 text-white">
                    Start Practice Test <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
            </div>

            <div className="h-[200px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={history}>
                        <XAxis dataKey="date" stroke="#475569" fontSize={12} tickLine={false} axisLine={false} />
                        <YAxis stroke="#475569" fontSize={12} tickLine={false} axisLine={false} domain={[0, 100]} />
                        <Tooltip
                            contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #1e293b', borderRadius: '8px' }}
                            itemStyle={{ color: '#fbbf24' }}
                        />
                        <Line
                            type="monotone"
                            dataKey="score"
                            stroke="#fbbf24"
                            strokeWidth={3}
                            dot={{ fill: '#fbbf24', r: 4 }}
                            activeDot={{ r: 6 }}
                        />
                    </LineChart>
                </ResponsiveContainer>
            </div>
        </Card>
    )
}
