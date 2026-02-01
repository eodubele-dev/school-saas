"use client"

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
                class: 'prose prose-sm prose-invert max-w-none focus:outline-none min-h-[300px] p-4',
            },
        },
    })

    if (!editor) {
        return null
    }

    return (
        <div className="border border-white/10 rounded-lg overflow-hidden bg-slate-950/50">
            {editable && (
                <div className="bg-slate-900 border-b border-white/10 p-1 flex gap-1 flex-wrap">
                    <Toggle size="sm" className="text-slate-300 hover:text-white hover:bg-white/10 data-[state=on]:bg-blue-600 data-[state=on]:text-white" onPressedChange={() => editor.chain().focus().toggleBold().run()} disabled={!editor.can().chain().focus().toggleBold().run()} data-state={editor.isActive('bold') ? 'on' : 'off'}>
                        <Bold className="h-4 w-4" />
                    </Toggle>
                    <Toggle size="sm" className="text-slate-300 hover:text-white hover:bg-white/10 data-[state=on]:bg-blue-600 data-[state=on]:text-white" onPressedChange={() => editor.chain().focus().toggleItalic().run()} disabled={!editor.can().chain().focus().toggleItalic().run()} data-state={editor.isActive('italic') ? 'on' : 'off'}>
                        <Italic className="h-4 w-4" />
                    </Toggle>
                    <Toggle size="sm" className="text-slate-300 hover:text-white hover:bg-white/10 data-[state=on]:bg-blue-600 data-[state=on]:text-white" onPressedChange={() => editor.chain().focus().toggleUnderline().run()} disabled={!editor.can().chain().focus().toggleUnderline().run()} data-state={editor.isActive('underline') ? 'on' : 'off'}>
                        <UnderlineIcon className="h-4 w-4" />
                    </Toggle>
                    <div className="w-px h-6 bg-white/10 mx-1" />
                    <Toggle size="sm" className="text-slate-300 hover:text-white hover:bg-white/10 data-[state=on]:bg-blue-600 data-[state=on]:text-white" onPressedChange={() => editor.chain().focus().toggleHeading({ level: 1 }).run()} data-state={editor.isActive('heading', { level: 1 }) ? 'on' : 'off'}>
                        <Heading1 className="h-4 w-4" />
                    </Toggle>
                    <Toggle size="sm" className="text-slate-300 hover:text-white hover:bg-white/10 data-[state=on]:bg-blue-600 data-[state=on]:text-white" onPressedChange={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} data-state={editor.isActive('heading', { level: 2 }) ? 'on' : 'off'}>
                        <Heading2 className="h-4 w-4" />
                    </Toggle>
                    <Toggle size="sm" className="text-slate-300 hover:text-white hover:bg-white/10 data-[state=on]:bg-blue-600 data-[state=on]:text-white" onPressedChange={() => editor.chain().focus().toggleBulletList().run()} data-state={editor.isActive('bulletList') ? 'on' : 'off'}>
                        <List className="h-4 w-4" />
                    </Toggle>
                    <Toggle size="sm" className="text-slate-300 hover:text-white hover:bg-white/10 data-[state=on]:bg-blue-600 data-[state=on]:text-white" onPressedChange={() => editor.chain().focus().toggleOrderedList().run()} data-state={editor.isActive('orderedList') ? 'on' : 'off'}>
                        <ListOrdered className="h-4 w-4" />
                    </Toggle>
                </div>
            )}
            <EditorContent editor={editor} />
        </div>
    )
}
