"use client"

import { useState } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { DebtorsTab } from "@/components/finance/debtors-tab"
import { SettlementsTab } from "@/components/finance/settlements-tab"
import { Users, CreditCard, Search, Filter } from "lucide-react"

interface CollectionsHubProps {
    initialDebtors: any[]
    initialSettlements: any[]
    sessions: any[]
}

export function CollectionsHub({ initialDebtors, initialSettlements, sessions }: CollectionsHubProps) {
    const [activeTab, setActiveTab] = useState("debtors")

    return (
        <div className="p-6 space-y-6">
            <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-white tracking-tight glow-blue">Revenue & Collections</h1>
                    <p className="text-slate-400">Manage school fee recovery and online settlements.</p>
                </div>
                <div className="flex items-center gap-3">
                    <div className="px-4 py-2 rounded-lg bg-blue-500/10 border border-blue-500/20">
                        <p className="text-[10px] text-blue-400 uppercase font-bold tracking-wider">Total Outstanding</p>
                        <p className="text-xl font-bold text-white">
                            ₦{initialDebtors.reduce((acc, d) => acc + d.balance, 0).toLocaleString()}
                        </p>
                    </div>
                </div>
            </header>

            <Tabs defaultValue="debtors" className="w-full" onValueChange={setActiveTab}>
                <div className="flex items-center justify-between gap-4 mb-4">
                    <TabsList className="bg-slate-900 border border-white/5 p-1">
                        <TabsTrigger
                            value="debtors"
                            className="data-[state=active]:bg-[var(--school-accent)] data-[state=active]:text-white transition-all"
                        >
                            <Users className="h-4 w-4 mr-2" />
                            Debtors List
                        </TabsTrigger>
                        <TabsTrigger
                            value="settlements"
                            className="data-[state=active]:bg-[var(--school-accent)] data-[state=active]:text-white transition-all"
                        >
                            <CreditCard className="h-4 w-4 mr-2" />
                            Paystack Settlements
                        </TabsTrigger>
                    </TabsList>
                </div>

                <TabsContent value="debtors" className="mt-0 border-none p-0 outline-none">
                    <DebtorsTab initialData={initialDebtors} sessions={sessions} />
                </TabsContent>

                <TabsContent value="settlements" className="mt-0 border-none p-0 outline-none">
                    <SettlementsTab initialData={initialSettlements} />
                </TabsContent>
            </Tabs>
        </div>
    )
}
