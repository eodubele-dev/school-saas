import { createFactoryTenant } from "@/lib/actions/global"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Building2, ArrowLeft } from "lucide-react"
import Link from "next/link"
import { redirect } from "next/navigation"

export default function NewCampusPage({ params }: { params: { domain: string } }) {
    async function action(formData: FormData) {
        'use server'
        const result = await createFactoryTenant(formData)

        if (result.error) {
            // In a real app we'd show a toast here via client component or handle state
            // For now, we'll just log it server side, maybe throw to error boundary
            console.error(result.error)
            throw new Error(result.error)
        }

        if (result.success) {
            // Redirect to the new campus dashboard
            // Assuming localhost development structure or wildcard dns
            redirect(`//${result.tenant.slug}.localhost:3000/dashboard`)
        }
    }

    return (
        <div className="container max-w-2xl py-10 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div>
                <Link
                    href="/dashboard"
                    className="inline-flex items-center text-sm text-slate-400 hover:text-white mb-4 transition-colors"
                >
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Back to Dashboard
                </Link>
                <div className="flex items-center gap-4">
                    <div className="p-3 rounded-xl bg-indigo-500/10 border border-indigo-500/20">
                        <Building2 className="h-8 w-8 text-indigo-400" />
                    </div>
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight text-white glow-text">Launch New Campus</h1>
                        <p className="text-slate-400">Expand your institution by deploying a new digital campus node.</p>
                    </div>
                </div>
            </div>

            <Card className="bg-slate-900/50 border-white/10">
                <CardHeader>
                    <CardTitle className="text-white">Campus Details</CardTitle>
                    <CardDescription className="text-slate-400">
                        Configure the basic identity of the new school branch.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <form action={action} className="space-y-6">
                        <div className="space-y-2">
                            <Label htmlFor="name" className="text-white">Campus Name</Label>
                            <Input
                                id="name"
                                name="name"
                                placeholder="e.g. Lekki Phase 1 Campus"
                                required
                                className="bg-white/5 border-white/10 text-white placeholder:text-slate-600 focus:border-indigo-500"
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="slug" className="text-white">Subdomain Slug</Label>
                            <Input
                                id="slug"
                                name="slug"
                                placeholder="e.g. lekki-phase-1"
                                required
                                pattern="[a-z0-9-]+"
                                title="Lowercase letters, numbers, and hyphens only."
                                className="bg-white/5 border-white/10 text-white placeholder:text-slate-600 focus:border-indigo-500"
                            />
                            <p className="text-xs text-slate-500">
                                This will be used for the URL: <span className="font-mono text-indigo-400">slug.eduflow.ng</span>
                            </p>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="address" className="text-white">Physical Address (Optional)</Label>
                            <Input
                                id="address"
                                name="address"
                                placeholder="123 Education Drive..."
                                className="bg-white/5 border-white/10 text-white placeholder:text-slate-600 focus:border-indigo-500"
                            />
                        </div>

                        <div className="pt-4">
                            <Button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-700 text-white">
                                <Building2 className="mr-2 h-4 w-4" />
                                Deploy Campus Node
                            </Button>
                        </div>
                    </form>
                </CardContent>
            </Card>
        </div>
    )
}
