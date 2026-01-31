import { Card, CardContent } from "@/components/ui/card"
import { Construction } from "lucide-react"

export default function ChildProfilePage() {
    return (
        <div className="flex h-[50vh] items-center justify-center animate-in fade-in duration-500">
            <Card className="bg-slate-900/50 border-white/5 backdrop-blur-xl w-full max-w-md">
                <CardContent className="flex flex-col items-center justify-center p-12 text-center space-y-4">
                    <div className="h-16 w-16 bg-cyan-500/10 rounded-full flex items-center justify-center border border-cyan-500/20 mb-4">
                        <Construction className="h-8 w-8 text-cyan-400" />
                    </div>
                    <h2 className="text-2xl font-bold text-white">Child Profile</h2>
                    <p className="text-slate-400">This feature is currently being developed.</p>
                </CardContent>
            </Card>
        </div>
    )
}
