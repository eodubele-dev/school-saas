
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import Link from "next/link"
import { login } from '@/app/actions/auth'

export default function MarketingLoginPage() {
    return (
        <div className="flex h-screen w-full items-center justify-center bg-slate-50 dark:bg-slate-900 px-4">
            <div className="absolute top-0 left-0 w-full h-full bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none" />

            <Card className="w-full max-w-sm relative z-10 shadow-2xl border-white/10 dark:bg-slate-950/80 backdrop-blur-md">
                <CardHeader className="text-center">
                    <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-emerald-green/10 text-emerald-green border border-emerald-green/20">
                        ✨
                    </div>
                    <CardTitle className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-emerald-green to-teal-500">
                        Admin Access
                    </CardTitle>
                    <CardDescription>
                        Platform login for school owners
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <form action={login} className="grid gap-4">
                        <div className="grid gap-2">
                            <Label htmlFor="email">Email</Label>
                            <Input
                                id="email"
                                name="email"
                                type="email"
                                placeholder="owner@example.com"
                                required
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="password">Password</Label>
                            <Input
                                id="password"
                                name="password"
                                type="password"
                                required
                            />
                        </div>
                        <Button className="w-full bg-emerald-green hover:bg-emerald-600 shadow-glow-green" type="submit">
                            Sign in to Console
                        </Button>
                    </form>
                </CardContent>
                <CardFooter className="justify-center text-sm text-muted-foreground">
                    <Link href="/" className="hover:text-emerald-green transition-colors">
                        ← Back to Home
                    </Link>
                </CardFooter>
            </Card>
        </div>
    )
}
