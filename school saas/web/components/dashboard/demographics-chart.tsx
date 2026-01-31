"use client"

import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from "recharts"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

const data = [
    { name: "Male", value: 450 },
    { name: "Female", value: 520 },
    { name: "Others", value: 30 },
]

const COLORS = ["#3B82F6", "#EC4899", "#64748B"]

export function DemographicsChart() {
    return (
        <Card className="bg-slate-900/50 border-white/5 backdrop-blur-xl shadow-lg h-full">
            <CardHeader>
                <CardTitle className="text-slate-400 font-medium text-sm">Student Demographics</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="h-[240px] w-full flex items-center justify-center">
                    <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                            <Pie
                                data={data}
                                cx="50%"
                                cy="50%"
                                innerRadius={60}
                                outerRadius={80}
                                paddingAngle={5}
                                dataKey="value"
                                stroke="none"
                            >
                                {data.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                ))}
                            </Pie>
                            <Tooltip
                                contentStyle={{
                                    backgroundColor: '#0f172a',
                                    borderColor: '#1e293b',
                                    borderRadius: '8px',
                                    color: '#f8fafc'
                                }}
                            />
                            <Legend
                                verticalAlign="middle"
                                align="right"
                                layout="vertical"
                                iconType="circle"
                            />
                        </PieChart>
                    </ResponsiveContainer>
                </div>
            </CardContent>
        </Card>
    )
}
