"use client"

import { Button } from "@/components/ui/button"
import { Printer, Share2 } from "lucide-react"
import { toast } from "sonner"
import { IdCardModal } from "./id-card-modal"

export function ProfileActions({ student, tenant }: { student: any, tenant: any }) {

    const handleShare = async () => {
        if (navigator.share) {
            try {
                await navigator.share({
                    title: 'Student Profile',
                    text: 'Check out this student profile.',
                    url: window.location.href,
                })
            } catch (error) {
                console.log('Error sharing:', error)
            }
        } else {
            // Fallback
            navigator.clipboard.writeText(window.location.href)
            toast.success("Profile link copied to clipboard!")
        }
    }

    return (
        <div className="flex gap-3 z-10">
            <Button
                onClick={handleShare}
                variant="outline"
                className="border-white/10 text-slate-300 hover:text-white hover:bg-white/5 bg-slate-900/50 backdrop-blur-sm"
            >
                <Share2 className="h-4 w-4 mr-2" />
                <span className="hidden sm:inline">Share</span>
            </Button>

            <IdCardModal
                student={student}
                tenant={tenant}
                trigger={
                    <Button
                        className="bg-[var(--school-accent)] hover:bg-blue-600 text-white border-0 shadow-lg shadow-blue-900/20"
                    >
                        <Printer className="h-4 w-4 mr-2" />
                        Print ID Card
                    </Button>
                }
            />
        </div>
    )
}
