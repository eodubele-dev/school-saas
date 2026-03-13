"use client"

import { useState, useEffect } from "react"
import { getClassesPendingApproval } from "@/lib/actions/results"
import { PrincipalApprovalModal } from "@/components/admin/results/principal-approval-modal"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { FileCheck, Activity, Search, RefreshCw } from "lucide-react"
import { Input } from "@/components/ui/input"
import { toast } from "sonner"

export default function ResultApprovalsPage() {
    const [pendingResults, setPendingResults] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [search, setSearch] = useState("")
    const [selectedResult, setSelectedResult] = useState<any | null>(null)

    const fetchPending = async () => {
        setLoading(true)
        try {
            const res = await getClassesPendingApproval()
            if (res.success && res.data) {
                setPendingResults(res.data)
            }
        } catch (e) {
            toast.error("Failed to load pending results")
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchPending()
    }, [])

    const filteredResults = pendingResults.filter(r => {
        const studentName = r.students ? `${r.students.first_name} ${r.students.last_name}`.toLowerCase() : ''
        const className = r.classes ? r.classes.name.toLowerCase() : ''
        const s = search.toLowerCase()
        return studentName.includes(s) || className.includes(s)
    })

    return (
        <div className="h-[calc(100vh-80px)] p-6 md:p-8 flex flex-col animate-in fade-in duration-700">
            {/* Header */}
            <div className="flex items-center gap-3 mb-8 justify-between">
                <div className="flex items-center gap-3">
                    <div className="bg-emerald-500/10 p-2.5 rounded-lg border border-emerald-500/20 shadow-[0_0_15px_rgba(16,185,129,0.15)]">
                        <FileCheck className="h-6 w-6 text-emerald-500" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-white tracking-tight">Result Approvals</h1>
                        <p className="text-slate-400 text-xs mt-0.5">Review and publish teacher-submitted termly results and behaviors.</p>
                    </div>
                </div>
                <Button variant="outline" size="sm" onClick={fetchPending} disabled={loading} className="gap-2">
                    <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
                    Refresh
                </Button>
            </div>

            <Card className="flex-1 bg-card text-card-foreground border-border overflow-hidden flex flex-col">
                <div className="p-4 border-b border-border flex justify-between items-center bg-card">
                    <div className="relative w-full md:w-80">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Search by student or class..."
                            className="pl-9 bg-card text-card-foreground border-border/50 h-9 text-sm text-foreground focus:bg-slate-800 transition-all border-border"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </div>
                    <Badge variant="outline" className="border-amber-500/20 text-amber-500 bg-amber-500/10 py-1">
                        {pendingResults.length} Pending Approvals
                    </Badge>
                </div>

                <div className="flex-1 overflow-auto p-4">
                    {loading ? (
                        <div className="flex items-center justify-center p-20 text-muted-foreground">Loading pending results...</div>
                    ) : filteredResults.length === 0 ? (
                        <div className="flex flex-col items-center justify-center p-20 text-center text-muted-foreground">
                            <Activity className="h-16 w-16 mb-4 opacity-20" />
                            <p className="text-lg font-bold">You're all caught up!</p>
                            <p className="text-sm max-w-sm mt-2">There are no termly results currently waiting for principal approval.</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                            {filteredResults.map(result => (
                                <Card key={result.id} className="bg-slate-950/50 border border-border p-4 hover:border-emerald-500/50 transition-colors flex flex-col group">
                                    <div className="mb-3">
                                        <div className="text-xs text-muted-foreground font-mono mb-1">{result.session_id} • {result.term}</div>
                                        <h3 className="font-bold text-slate-200">
                                            {result.students ? `${result.students.first_name} ${result.students.last_name}` : 'Unknown'}
                                        </h3>
                                        <div className="text-xs font-semibold text-emerald-400 mt-0.5">
                                            Class: {result.classes ? result.classes.name : 'Unknown'}
                                        </div>
                                    </div>
                                    
                                    <div className="text-[11px] text-slate-400 line-clamp-3 mb-4 italic flex-1 bg-black/20 p-2 rounded">
                                        "{result.teacher_remark}"
                                    </div>
                                    
                                    <Button 
                                        className="w-full bg-emerald-600/20 hover:bg-emerald-600 text-emerald-500 hover:text-white border border-emerald-500/30 transition-all"
                                        size="sm"
                                        onClick={() => setSelectedResult(result)}
                                    >
                                        Review & Approve
                                    </Button>
                                </Card>
                            ))}
                        </div>
                    )}
                </div>
            </Card>

            <PrincipalApprovalModal 
                isOpen={!!selectedResult} 
                onClose={() => setSelectedResult(null)} 
                result={selectedResult}
                onPublished={() => {
                    fetchPending()
                }}
            />
        </div>
    )
}
