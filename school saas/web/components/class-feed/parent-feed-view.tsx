"use client"

import { format } from "date-fns"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import type { ClassFeedPost } from "@/lib/actions/class-feed"

interface ParentFeedViewProps {
    posts: ClassFeedPost[]
}

export function ParentFeedView({ posts }: ParentFeedViewProps) {
    if (posts.length === 0) {
        return (
            <Card>
                <CardContent className="p-8 text-center text-muted-foreground">
                    No class updates available at this time.
                </CardContent>
            </Card>
        )
    }

    return (
        <div className="space-y-6">
            {posts.map(post => (
                <Card key={post.id} className="overflow-hidden bg-white border-card">
                    <CardHeader className="flex flex-row items-start space-x-4 pb-4">
                        <Avatar>
                            <AvatarFallback>{post.teacher_name.substring(0, 2).toUpperCase()}</AvatarFallback>
                        </Avatar>
                        <div className="space-y-1">
                            <CardTitle className="text-base font-semibold">{post.title}</CardTitle>
                            <CardDescription className="text-sm">
                                {post.teacher_name} • {post.class_name} • {format(new Date(post.created_at), "MMM d, yyyy h:mm a")}
                            </CardDescription>
                        </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="whitespace-pre-wrap text-sm text-slate-700">
                            {post.content}
                        </div>

                        {/* Image Grid */}
                        {post.attachments && post.attachments.length > 0 && (
                            <div className={`grid gap-2 ${post.attachments.length === 1 ? 'grid-cols-1' :
                                    post.attachments.length === 2 ? 'grid-cols-2' : 'grid-cols-2 md:grid-cols-3'
                                }`}>
                                {post.attachments.map(att => (
                                    <div key={att.id} className="rounded-md overflow-hidden bg-slate-100 border relative aspect-video">
                                        {/* eslint-disable-next-line @next/next/no-img-element */}
                                        <img
                                            src={att.file_url}
                                            alt="Attachment"
                                            className="w-full h-full object-cover transition-transform hover:scale-105"
                                            loading="lazy"
                                        />
                                    </div>
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>
            ))}
        </div>
    )
}
