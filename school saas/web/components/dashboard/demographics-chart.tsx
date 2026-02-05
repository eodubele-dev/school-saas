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
        <Card className="bg-slate-900/90 border-white/10 backdrop-blur-xl shadow-2xl">
            <CardHeader className="pb-2">
                <CardTitle className="text-slate-400 font-medium text-xs uppercase tracking-wider">Student Demographics</CardTitle>
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
                                    borderColor: 'rgba(255,255,255,0.1)',
                                    borderRadius: '8px',
                                    color: '#ffffff',
                                    fontWeight: '500',
                                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)'
                                }}
                                itemStyle={{ color: '#fff' }}
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
