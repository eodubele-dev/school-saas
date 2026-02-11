'use client'

import { useState, useTransition, useEffect } from "react"
import { getAuditLogs, AuditLog } from "@/lib/actions/audit"
import { AuditItem } from "@/components/security/audit-item"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Search, Loader2, RefreshCw } from "lucide-react"
import { createClient } from "@/lib/supabase/client"

export function AuditFeed({ initialLogs, domain }: { initialLogs: any, domain: string }) {
    const [logs, setLogs] = useState<AuditLog[]>(initialLogs.data || [])
    const [page, setPage] = useState(1)
    const [isPending, startTransition] = useTransition()
    const [filters, setFilters] = useState({
        query: "",
        category: "all"
    })

    const fetchLogs = (newPage = 1, currentFilters = filters) => {
        startTransition(async () => {
            const res = await getAuditLogs(domain, {
                page: newPage,
                query: currentFilters.query,
                category: currentFilters.category
            })
            if (res.success && res.data) {
                setLogs(res.data)
                setPage(newPage)
            }
        })
    }

    // Realtime Subscription
    useEffect(() => {
        const supabase = createClient()

        // Subscribe to NEW audit logs for this tenant
        // Note: RLS will automatically filter these for us
        const channel = supabase
            .channel('audit-changes')
            .on(
                'postgres_changes',
                {
                    event: 'INSERT',
                    schema: 'public',
                    table: 'audit_logs'
                },
                (payload) => {
                    // Prepend new log if it matches current filter category
                    const newLog = payload.new as AuditLog
                    if (filters.category === 'all' || newLog.category === filters.category) {
                        setLogs(prev => [newLog, ...prev].slice(0, 20))
                    }
                }
            )
            .subscribe()

        return () => {
            supabase.removeChannel(channel)
        }
    }, [filters.category])

    const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
        const query = e.target.value
        setFilters(prev => ({ ...prev, query }))
    }

    const handleCategoryChange = (value: string) => {
        const newFilters = { ...filters, category: value }
        setFilters(newFilters)
        fetchLogs(1, newFilters)
    }

    return (
        <div className="space-y-6">
            {/* Toolbar */}
            <div className="flex flex-col sm:flex-row gap-4">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                    <Input
                        placeholder="Search logs by user, action, or details..."
                        className="pl-10 bg-black/20 border-slate-800 text-slate-200 focus:border-blue-500/50 font-mono text-sm"
                        value={filters.query}
                        onChange={handleSearch}
                        onKeyDown={(e) => e.key === 'Enter' && fetchLogs(1)}
                    />
                </div>
                <Select value={filters.category} onValueChange={handleCategoryChange}>
                    <SelectTrigger className="w-[180px] bg-black/20 border-slate-800 text-slate-300 font-mono text-xs">
                        <SelectValue placeholder="Category" />
                    </SelectTrigger>
                    <SelectContent className="bg-slate-900 border-slate-800 text-slate-300">
                        <SelectItem value="all">All Categories</SelectItem>
                        <SelectItem value="Financial">Financial</SelectItem>
                        <SelectItem value="Academic">Academic</SelectItem>
                        <SelectItem value="Security">Security</SelectItem>
                        <SelectItem value="System">System</SelectItem>
                    </SelectContent>
                </Select>
                <Button
                    variant="outline"
                    size="icon"
                    className="border-slate-800 bg-black/20 text-slate-400 hover:text-white hover:bg-slate-800"
                    onClick={() => fetchLogs(1)}
                >
                    {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
                </Button>
            </div>

            {/* Feed */}
            <div className="space-y-4 min-h-[400px]">
                {isPending ? (
                    <div className="flex items-center justify-center min-h-[400px] text-slate-500 font-mono text-xs">
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        SYNCING INTEGRITY STREAM...
                    </div>
                ) : logs.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-20 text-slate-500 border border-dashed border-slate-800 rounded-lg bg-slate-950/20">
                        <Server className="h-8 w-8 mb-4 opacity-20" />
                        <p className="font-mono text-xs">No audit logs found matching your criteria.</p>
                    </div>
                ) : (
                    logs.map((log) => (
                        <AuditItem key={log.id} log={log} />
                    ))
                )}
            </div>

            {/* Simple Pagination */}
            <div className="flex justify-between items-center pt-4 border-t border-slate-800/50">
                <Button
                    variant="ghost"
                    size="sm"
                    disabled={page === 1 || isPending}
                    onClick={() => fetchLogs(page - 1)}
                    className="text-slate-500 hover:text-white hover:bg-slate-900 font-mono text-[10px]"
                >
                    PREVIOUS
                </Button>
                <div className="text-[10px] text-slate-600 font-mono bg-slate-950 px-3 py-1 rounded-full border border-slate-900">
                    PAGE {page}
                </div>
                <Button
                    variant="ghost"
                    size="sm"
                    disabled={isPending || logs.length < 20}
                    onClick={() => fetchLogs(page + 1)}
                    className="text-slate-500 hover:text-white hover:bg-slate-900 font-mono text-[10px]"
                >
                    NEXT
                </Button>
            </div>
        </div>
    )
}

import { Server } from "lucide-react"
