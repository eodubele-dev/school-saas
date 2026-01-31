"use client"

import { Edit } from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"

export function EditRequestButton() {
    const handleEditRequest = () => {
        toast.info("Edit Request Sent", {
            description: "Admin has been notified to update these records.",
            duration: 4000,
            action: {
                label: "Undo",
                onClick: () => console.log("Undo")
            }
        })
    }

    return (
        <Button
            onClick={handleEditRequest}
            variant="outline"
            className="bg-transparent border-cyan-500/20 text-cyan-400 hover:bg-cyan-500/10 hover:text-cyan-300 gap-2 transition-all active:scale-95"
        >
            <Edit className="h-4 w-4" />
            <span className="hidden md:inline">Request Edit</span>
        </Button>
    )
}
