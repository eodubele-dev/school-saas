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
            <Card className="bg-slate-900/50 border-white/5 backdrop-blur-xl">
                <CardContent className="p-8 text-center text-slate-400">
                    No class updates available at this time.
                </CardContent>
            </Card>
        )
    }

    return (
        <div className="space-y-6">
            {posts.map(post => (
                <Card key={post.id} className="overflow-hidden bg-slate-900/50 border-white/5 backdrop-blur-xl transition-all hover:border-blue-500/30 group">
                    <CardHeader className="flex flex-row items-start space-x-4 pb-4 border-b border-white/5 bg-white/5">
                        <Avatar className="h-10 w-10 border border-white/10">
                            <AvatarFallback className="bg-blue-600 text-white font-bold">{post.teacher_name.substring(0, 2).toUpperCase()}</AvatarFallback>
                        </Avatar>
                        <div className="space-y-1">
                            <CardTitle className="text-base font-semibold text-white group-hover:text-blue-400 transition-colors">{post.title}</CardTitle>
                            <CardDescription className="text-sm text-slate-400">
                                {post.teacher_name} • {post.class_name} • {format(new Date(post.created_at), "MMM d, yyyy h:mm a")}
                            </CardDescription>
                        </div>
                    </CardHeader>
                    <CardContent className="space-y-4 pt-4">
                        <div className="whitespace-pre-wrap text-sm text-slate-300 leading-relaxed">
                            {post.content}
                        </div>

                        {/* Image Grid */}
                        {post.attachments && post.attachments.length > 0 && (
                            <div className={`grid gap-2 ${post.attachments.length === 1 ? 'grid-cols-1' :
                                post.attachments.length === 2 ? 'grid-cols-2' : 'grid-cols-2 md:grid-cols-3'
                                }`}>
                                {post.attachments.map(att => (
                                    <div key={att.id} className="rounded-md overflow-hidden bg-slate-950 border border-white/10 relative aspect-video">
                                        {/* eslint-disable-next-line @next/next/no-img-element */}
                                        <img
                                            src={att.file_url}
                                            alt="Attachment"
                                            className="w-full h-full object-cover transition-transform hover:scale-105 opacity-90 hover:opacity-100"
                                            loading="lazy"
                                        />
                                    </div>
                                ))}
                            </div>
                        )}
                    </CardContent>
                    <div className="px-6 py-3 bg-white/5 border-t border-white/5 flex justify-end">
                        <div className="text-xs text-blue-400 font-medium cursor-pointer hover:text-blue-300 transition-colors">
                            Read full update &rarr;
                        </div>
                    </div>
                </Card>
            ))}
        </div>
    )
}
