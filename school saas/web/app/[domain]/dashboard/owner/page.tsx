"use client"

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip, CartesianGrid, Line, LineChart } from "recharts"
import { Users, Clock, TrendingUp, Zap } from "lucide-react"

// Mock Data (In production, fetch from DB via Server Actions)
const ATTENDANCE_DATA = [
    { day: "Mon", onTime: 45, late: 5 },
    { day: "Tue", onTime: 48, late: 2 },
    { day: "Wed", onTime: 40, late: 10 },
    { day: "Thu", onTime: 42, late: 8 },
    { day: "Fri", onTime: 35, late: 15 },
]

const GRADES_VELOCITY_DATA = [
    { class: "JSS 1", uploaded: 85 },
    { class: "JSS 2", uploaded: 60 },
    { class: "JSS 3", uploaded: 92 },
    { class: "SS 1", uploaded: 40 },
    { class: "SS 2", uploaded: 75 },
    { class: "SS 3", uploaded: 100 },
]

const AI_ENGAGEMENT_DATA = [
    { name: "Week 1", plans: 12 },
    { name: "Week 2", plans: 19 },
    { name: "Week 3", plans: 25 },
    { name: "Week 4", plans: 42 },
]

export default function OwnerDashboard() {
    return (
        <div className="flex-1 space-y-4 p-8 pt-6">
            <div className="flex items-center justify-between space-y-2">
                <h2 className="text-3xl font-bold tracking-tight text-slate-900">Proprietor&apos;s Insight</h2>
                <div className="flex items-center space-x-2">
                    <span className="text-sm text-slate-500">Last updated: Just now</span>
                </div>
            </div>

            {/* KPI Cards */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Punctuality Score</CardTitle>
                        <Clock className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-green-600">82%</div>
                        <p className="text-xs text-muted-foreground">+2% from last week</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Result Velocity</CardTitle>
                        <TrendingUp className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">75.3%</div>
                        <p className="text-xs text-muted-foreground">Grades uploaded this term</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">AI Engagement</CardTitle>
                        <Zap className="h-4 w-4 text-amber-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">98</div>
                        <p className="text-xs text-muted-foreground">Lesson plans generated</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Active Students</CardTitle>
                        <Users className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">1,203</div>
                        <p className="text-xs text-muted-foreground">Across all arms</p>
                    </CardContent>
                </Card>
            </div>

            {/* Charts */}
            <Tabs defaultValue="overview" className="space-y-4">
                <TabsList>
                    <TabsTrigger value="overview">Overview</TabsTrigger>
                    <TabsTrigger value="academic">Academic</TabsTrigger>
                    <TabsTrigger value="staff">Staff Performance</TabsTrigger>
                </TabsList>

                <TabsContent value="overview" className="space-y-4">
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
                        <Card className="col-span-4">
                            <CardHeader>
                                <CardTitle>Staff Punctuality Trends</CardTitle>
                                <CardDescription>Daily clock-in comparison (On Time vs Late)</CardDescription>
                            </CardHeader>
                            <CardContent className="pl-2">
                                <ResponsiveContainer width="100%" height={350}>
                                    <BarChart data={ATTENDANCE_DATA}>
                                        <XAxis dataKey="day" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
                                        <YAxis stroke="#888888" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `${value}`} />
                                        <Tooltip cursor={{ fill: 'transparent' }} />
                                        <Bar dataKey="onTime" name="Early/On Time" fill="#16a34a" radius={[4, 4, 0, 0]} />
                                        <Bar dataKey="late" name="Late Arrival" fill="#dc2626" radius={[4, 4, 0, 0]} />
                                    </BarChart>
                                </ResponsiveContainer>
                            </CardContent>
                        </Card>

                        <Card className="col-span-3">
                            <CardHeader>
                                <CardTitle>Result Upload Velocity</CardTitle>
                                <CardDescription>Completion % by Class</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-8">
                                    {GRADES_VELOCITY_DATA.map((item, idx) => (
                                        <div key={idx} className="flex items-center">
                                            <div className="space-y-1 flex-1">
                                                <p className="text-sm font-medium leading-none">{item.class}</p>
                                                <div className="w-full bg-secondary h-2 rounded-full mt-2">
                                                    <div
                                                        className={`h-2 rounded-full ${item.uploaded === 100 ? 'bg-green-500' : 'bg-blue-500'}`}
                                                        style={{ width: `${item.uploaded}%` }}
                                                    />
                                                </div>
                                            </div>
                                            <div className="ml-4 font-medium">{item.uploaded}%</div>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    <div className="grid gap-4 md:grid-cols-1">
                        <Card>
                            <CardHeader>
                                <CardTitle>AI Adoption Growth</CardTitle>
                                <CardDescription>Weekly generated lesson plans</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <ResponsiveContainer width="100%" height={240}>
                                    <LineChart data={AI_ENGAGEMENT_DATA}>
                                        <XAxis dataKey="name" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
                                        <YAxis stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                        <Tooltip />
                                        <Line type="monotone" dataKey="plans" stroke="#6366f1" strokeWidth={3} activeDot={{ r: 8 }} />
                                    </LineChart>
                                </ResponsiveContainer>
                            </CardContent>
                        </Card>
                    </div>
                </TabsContent>
            </Tabs>
        </div>
    )
}
