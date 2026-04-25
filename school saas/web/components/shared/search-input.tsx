"use client"

import { Search } from "lucide-react"
import { Input } from "@/components/ui/input"
import { useRouter, useSearchParams, usePathname } from "next/navigation"
import { useEffect, useState } from "react"

export function SearchInput({ placeholder = "Search..." }: { placeholder?: string }) {
    const router = useRouter()
    const searchParams = useSearchParams()
    const pathname = usePathname()
    const [query, setQuery] = useState(searchParams.get('query') || "")

    useEffect(() => {
        const currentQueryInUrl = searchParams.get('query') || ""
        if (query === currentQueryInUrl) return

        const timer = setTimeout(() => {
            const params = new URLSearchParams(searchParams)
            if (query) {
                params.set('query', query)
            } else {
                params.delete('query')
            }
            params.set('page', '1') // Reset to page 1 on new search
            router.replace(`${pathname}?${params.toString()}`)
        }, 300)

        return () => clearTimeout(timer)
    }, [query, router, pathname, searchParams])

    return (
        <div className="relative w-64">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-slate-500" />
            <Input 
                placeholder={placeholder} 
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="pl-8 bg-slate-950 border-white/10 text-white" 
            />
        </div>
    )
}
