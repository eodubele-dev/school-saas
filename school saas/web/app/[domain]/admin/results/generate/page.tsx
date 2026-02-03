import { triggerResultNotification } from "@/lib/actions/notification-engine"
import { Send } from "lucide-react"

// ... inside component ...
const [publishing, setPublishing] = useState(false)

const handlePublish = async () => {
    if (!resultData || !studentId) return

    // Confirm dialog or just go? "One-Click Trigger" implies speed, but safety is good.
    // We'll just trigger it for this single student.
    setPublishing(true)
    try {
        const res = await triggerResultNotification({
            studentId,
            term: "1st", // Hardcoded for demo parity with generation
            session: "2025/2026"
        })

        if (res.success) {
            toast.success("Result Published & Parents Notified! 🚀")
        } else {
            toast.error("Failed to notify parents")
        }
    } catch (e) {
        toast.error("Publishing error")
    } finally {
        setPublishing(false)
    }
}

// ... inside JSX ...
                    <div className="flex justify-end gap-3">
                         <Button 
                            onClick={handlePublish} 
                            disabled={publishing}
                            className="bg-indigo-600 hover:bg-indigo-500 text-white"
                        >
                            {publishing ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Send className="mr-2 h-4 w-4" />}
                            Publish & Notify Parents
                        </Button>
                        <Button onClick={handlePrint} className="bg-green-600 hover:bg-green-500">
                            <Printer className="mr-2 h-4 w-4" /> Print Result
                        </Button>
                    </div>

                    <div className="overflow-auto bg-slate-800/50 p-8 rounded-xl border border-white/5 flex justify-center">
                        {/* Print Container */}
                        <div ref={printRef}>
                            <ResultSheet
                                data={resultData}
                                schoolName="Achievers International College" // Mock tenant name
                                schoolLogo="/logo.png" // Mock
                            />
                        </div>
                    </div>
                </div >
            )}
        </div >
    )
}
