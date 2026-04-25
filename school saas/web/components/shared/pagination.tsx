"use client"

import { ChevronLeft, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useRouter, useSearchParams, usePathname } from "next/navigation"

interface PaginationProps {
    currentPage: number
    totalPages: number
    totalCount: number
    pageSize: number
}

export function SimplePagination({ currentPage, totalPages, totalCount, pageSize }: PaginationProps) {
    const router = useRouter()
    const searchParams = useSearchParams()
    const pathname = usePathname()

    const handlePageChange = (newPage: number) => {
        if (newPage < 1 || newPage > totalPages) return
        const params = new URLSearchParams(searchParams)
        params.set('page', newPage.toString())
        router.push(`${pathname}?${params.toString()}`)
    }

    if (totalPages <= 1) return null

    const startItem = (currentPage - 1) * pageSize + 1
    const endItem = Math.min(currentPage * pageSize, totalCount)

    return (
        <div className="flex items-center justify-between px-2 py-4">
            <div className="text-sm text-slate-400">
                Showing <span className="text-white font-medium">{startItem}</span> to <span className="text-white font-medium">{endItem}</span> of <span className="text-white font-medium">{totalCount}</span> results
            </div>
            <div className="flex items-center gap-2">
                <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage <= 1}
                    className="bg-slate-900 border-white/10 text-slate-300 hover:bg-slate-800 hover:text-white"
                >
                    <ChevronLeft className="h-4 w-4 mr-1" /> Previous
                </Button>
                <div className="text-sm text-slate-400 px-2">
                    Page <span className="text-white font-medium">{currentPage}</span> of <span className="text-white font-medium">{totalPages}</span>
                </div>
                <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage >= totalPages}
                    className="bg-slate-900 border-white/10 text-slate-300 hover:bg-slate-800 hover:text-white"
                >
                    Next <ChevronRight className="h-4 w-4 ml-1" />
                </Button>
            </div>
        </div>
    )
}
