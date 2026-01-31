"use client"

import { useState } from "react"
import { seedTestUsers } from "@/app/actions/seed"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Loader2, CheckCircle2, AlertCircle } from "lucide-react"

export default function SetupPage() {
    const [isLoading, setIsLoading] = useState(false)
    const [result, setResult] = useState<any>(null)
    const [error, setError] = useState<string | null>(null)

    const handleSeed = async () => {
        setIsLoading(true)
        setError(null)
        setResult(null)
        try {
            const data = await seedTestUsers()
            if (data.error) {
                setError(data.error)
            } else {
                setResult(data)
            }
        } catch (err) {
            setError("An unexpected error occurred.")
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
            <Card className="w-full max-w-md bg-slate-900 border-slate-800 text-white">
                <CardHeader>
                    <CardTitle className="text-2xl text-emerald-500">Dev Environment Setup</CardTitle>
                    <CardDescription>
                        Use this tool to generate test accounts for RBAC verification.
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    <p className="text-sm text-slate-400">
                        This operation will create or update the following users in the first available tenant school:
                    </p>

                    <div className="space-y-2 text-sm">
                        <div className="flex justify-between p-2 rounded bg-slate-950/50">
                            <span className="text-blue-400">Admin</span>
                            <span>admin@school1.com</span>
                        </div>
                        <div className="flex justify-between p-2 rounded bg-slate-950/50">
                            <span className="text-purple-400">Teacher</span>
                            <span>teacher@school1.com</span>
                        </div>
                        <div className="flex justify-between p-2 rounded bg-slate-950/50">
                            <span className="text-green-400">Parent</span>
                            <span>parent@school1.com</span>
                        </div>
                    </div>

                    <Button
                        onClick={handleSeed}
                        disabled={isLoading}
                        className="w-full bg-emerald-600 hover:bg-emerald-700 text-white"
                    >
                        {isLoading ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Seeding...
                            </>
                        ) : (
                            "Create Test Users"
                        )}
                    </Button>

                    {error && (
                        <Alert variant="destructive" className="bg-red-900/20 border-red-900/50 text-red-200">
                            <AlertCircle className="h-4 w-4" />
                            <AlertTitle>Error</AlertTitle>
                            <AlertDescription>{error}</AlertDescription>
                        </Alert>
                    )}

                    {result && (
                        <Alert className="bg-emerald-900/20 border-emerald-900/50 text-emerald-200">
                            <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                            <AlertTitle className="text-emerald-500">Success!</AlertTitle>
                            <AlertDescription className="space-y-2">
                                <p>Users created/updated successfully for tenant: <strong>{result.tenantSlug}</strong></p>
                                <p className="text-xs text-slate-400 mt-2">
                                    Login at: <a href={`http://${result.tenantSlug}.localhost:3001/login`} className="underline text-blue-400" target="_blank">
                                        http://{result.tenantSlug}.localhost:3001/login
                                    </a>
                                </p>
                            </AlertDescription>
                        </Alert>
                    )}
                </CardContent>
            </Card>
        </div>
    )
}
