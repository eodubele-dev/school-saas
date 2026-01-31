import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { QuestionUploader } from "@/components/cbt/question-uploader"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { BrainCircuit, BookOpen } from "lucide-react"

export default function CBTPracticePage() {
    return (
        <div className="flex-1 space-y-4 p-8 pt-6">
            <div className="flex items-center justify-between space-y-2">
                <h2 className="text-3xl font-bold tracking-tight">CBT Practice Portal</h2>
            </div>

            <Tabs defaultValue="practice" className="space-y-4">
                <TabsList>
                    <TabsTrigger value="practice">Take Mock Exam</TabsTrigger>
                    <TabsTrigger value="upload">Upload Past Questions (Admin)</TabsTrigger>
                </TabsList>

                <TabsContent value="practice" className="space-y-4">
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                        {/* Demo Cards - In real app these would be dynamic based on available Qs */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <BookOpen className="h-5 w-5 text-blue-500" />
                                    Mathematics (WAEC)
                                </CardTitle>
                                <CardDescription>20 Random Questions • 20 Mins</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <Link href="/cbt/practice/math-waec">
                                    <Button className="w-full">Start Practice</Button>
                                </Link>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <BookOpen className="h-5 w-5 text-green-500" />
                                    English (JAMB)
                                </CardTitle>
                                <CardDescription>Use of English • 15 Mins</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <Link href="/cbt/practice/english-jamb">
                                    <Button className="w-full">Start Practice</Button>
                                </Link>
                            </CardContent>
                        </Card>

                        <Card className="bg-muted/50 border-dashed">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2 text-muted-foreground">
                                    <BrainCircuit className="h-5 w-5" />
                                    AI Generated Mock
                                </CardTitle>
                                <CardDescription>Coming Soon</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <Button disabled variant="secondary" className="w-full">Generate Custom Test</Button>
                            </CardContent>
                        </Card>
                    </div>
                </TabsContent>

                <TabsContent value="upload">
                    <div className="max-w-xl mx-auto">
                        <QuestionUploader />
                    </div>
                </TabsContent>
            </Tabs>
        </div>
    )
}
