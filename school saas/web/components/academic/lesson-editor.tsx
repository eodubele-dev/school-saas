"use client"

import { useEffect } from 'react'
import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Underline from '@tiptap/extension-underline'
import { Toggle } from "@/components/ui/toggle"
import { Bold, Italic, Underline as UnderlineIcon, List, ListOrdered, Heading1, Heading2 } from "lucide-react"

interface LessonEditorProps {
    content: string
    onChange: (html: string) => void
    editable?: boolean
}

export function LessonEditor({ content, onChange, editable = true }: LessonEditorProps) {
    const editor = useEditor({
        immediatelyRender: false,
        extensions: [
            StarterKit,
            Underline
        ],
        content: content,
        editable: editable,
        onUpdate: ({ editor }) => {
            onChange(editor.getHTML())
        },
        editorProps: {
            attributes: {
                class: 'prose prose-slate max-w-none focus:outline-none min-h-[500px] p-0 text-slate-900 tracking-tight leading-relaxed',
            },
        },
    })

    // Sync editor content with prop changes (History load / Clear)
    useEffect(() => {
        if (editor && content !== editor.getHTML()) {
            editor.commands.setContent(content)
        }
    }, [content, editor])

    if (!editor) {
        return null
    }

    return (
        <div className="flex flex-col h-full overflow-visible group/canvas transition-all duration-700">
            {editable && (
                <div className="bg-white/70 backdrop-blur-lg border-b border-slate-200/60 p-1.5 px-3 flex gap-2 flex-wrap items-center z-30 sticky top-0 transition-all duration-500 rounded-t-sm shadow-[0_4px_12px_rgba(0,0,0,0.03)]">
                    {/* Precision Controls */}
                    <div className="flex items-center gap-1">
                        <div className="flex bg-slate-100/50 rounded-lg p-0.5 border border-slate-200/50">
                            <Toggle size="sm" className="text-slate-500 hover:text-slate-900 hover:bg-white data-[state=on]:bg-blue-600 data-[state=on]:text-white rounded-md transition-all h-8 w-8 border border-transparent data-[state=on]:border-blue-700 shadow-none" onPressedChange={() => editor.chain().focus().toggleBold().run()} disabled={!editor.can().chain().focus().toggleBold().run()} data-state={editor.isActive('bold') ? 'on' : 'off'}>
                                <Bold className="h-3.5 w-3.5" />
                            </Toggle>
                            <Toggle size="sm" className="text-slate-500 hover:text-slate-900 hover:bg-white data-[state=on]:bg-blue-600 data-[state=on]:text-white rounded-md transition-all h-8 w-8 border border-transparent data-[state=on]:border-blue-700 shadow-none" onPressedChange={() => editor.chain().focus().toggleItalic().run()} disabled={!editor.can().chain().focus().toggleItalic().run()} data-state={editor.isActive('italic') ? 'on' : 'off'}>
                                <Italic className="h-3.5 w-3.5" />
                            </Toggle>
                            <Toggle size="sm" className="text-slate-500 hover:text-slate-900 hover:bg-white data-[state=on]:bg-blue-600 data-[state=on]:text-white rounded-md transition-all h-8 w-8 border border-transparent data-[state=on]:border-blue-700 shadow-none" onPressedChange={() => editor.chain().focus().toggleUnderline().run()} disabled={!editor.can().chain().focus().toggleUnderline().run()} data-state={editor.isActive('underline') ? 'on' : 'off'}>
                                <UnderlineIcon className="h-3.5 w-3.5" />
                            </Toggle>
                        </div>

                        <div className="w-px h-4 bg-slate-200 mx-1" />

                        <div className="flex bg-slate-100/50 rounded-lg p-0.5 border border-slate-200/50">
                            <Toggle size="sm" className="text-slate-500 hover:text-slate-900 hover:bg-white data-[state=on]:bg-blue-600 data-[state=on]:text-white rounded-md transition-all h-8 w-8 border border-transparent data-[state=on]:border-blue-700 shadow-none" onPressedChange={() => editor.chain().focus().toggleHeading({ level: 1 }).run()} data-state={editor.isActive('heading', { level: 1 }) ? 'on' : 'off'}>
                                <Heading1 className="h-3.5 w-3.5" />
                            </Toggle>
                            <Toggle size="sm" className="text-slate-500 hover:text-slate-900 hover:bg-white data-[state=on]:bg-blue-600 data-[state=on]:text-white rounded-md transition-all h-8 w-8 border border-transparent data-[state=on]:border-blue-700 shadow-none" onPressedChange={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} data-state={editor.isActive('heading', { level: 2 }) ? 'on' : 'off'}>
                                <Heading2 className="h-3.5 w-3.5" />
                            </Toggle>
                        </div>

                        <div className="w-px h-4 bg-slate-200 mx-1" />

                        <div className="flex bg-slate-100/50 rounded-lg p-0.5 border border-slate-200/50">
                            <Toggle size="sm" className="text-slate-500 hover:text-slate-900 hover:bg-white data-[state=on]:bg-blue-600 data-[state=on]:text-white rounded-md transition-all h-8 w-8 border border-transparent data-[state=on]:border-blue-700 shadow-none" onPressedChange={() => editor.chain().focus().toggleBulletList().run()} data-state={editor.isActive('bulletList') ? 'on' : 'off'}>
                                <List className="h-3.5 w-3.5" />
                            </Toggle>
                            <Toggle size="sm" className="text-slate-500 hover:text-slate-900 hover:bg-white data-[state=on]:bg-blue-600 data-[state=on]:text-white rounded-md transition-all h-8 w-8 border border-transparent data-[state=on]:border-blue-700 shadow-none" onPressedChange={() => editor.chain().focus().toggleOrderedList().run()} data-state={editor.isActive('orderedList') ? 'on' : 'off'}>
                                <ListOrdered className="h-3.5 w-3.5" />
                            </Toggle>
                        </div>
                    </div>

                    {/* Metadata Bridge */}
                    <div className="ml-auto hidden sm:flex items-center gap-4 pr-2">
                        <div className="flex items-center gap-1.5 opacity-40 hover:opacity-100 transition-opacity cursor-help">
                            <span className="text-[9px] text-slate-400 font-bold uppercase tracking-[0.2em] leading-none">V 1.0.4</span>
                        </div>
                        <div className="w-px h-3 bg-slate-200" />
                        <div className="flex items-center gap-2">
                            <div className="h-1.5 w-1.5 rounded-full bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.3)] animate-pulse" />
                            <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest leading-none">Broadcast-Synced</span>
                        </div>
                    </div>
                </div>
            )}
            <div className="flex-1 p-8 lg:p-14">
                <EditorContent editor={editor} className="min-h-full" />
            </div>
        </div>
    )
}
