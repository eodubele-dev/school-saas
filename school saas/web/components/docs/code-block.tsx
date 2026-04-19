"use client"

import { useState } from "react"
import { Copy, Check, Terminal } from "lucide-react"

interface CodeBlockProps {
    code: string
    language?: string
    filename?: string
}

export function CodeBlock({ code, language = 'bash', filename }: CodeBlockProps) {
    const [copied, setCopied] = useState(false)

    const copyToClipboard = () => {
        navigator.clipboard.writeText(code)
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)
    }

    return (
        <div className="my-8 rounded-2xl overflow-hidden border border-white/5 bg-[#000000] shadow-2xl group">
            {/* Header / Tab Bar */}
            <div className="px-4 py-3 border-b border-white/5 bg-white/[0.02] flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="flex gap-1.5 border-r border-white/5 pr-4">
                        <div className="w-2.5 h-2.5 rounded-full bg-red-500/20" />
                        <div className="w-2.5 h-2.5 rounded-full bg-amber-500/20" />
                        <div className="w-2.5 h-2.5 rounded-full bg-emerald-500/20" />
                    </div>
                    {filename ? (
                        <span className="text-[10px] font-mono text-slate-500 tracking-wider uppercase">{filename}</span>
                    ) : (
                        <div className="flex items-center gap-2">
                            <Terminal className="w-3 h-3 text-slate-600" />
                            <span className="text-[10px] font-mono text-slate-500 tracking-wider uppercase">{language}</span>
                        </div>
                    )}
                </div>
                <button
                    onClick={copyToClipboard}
                    className="p-1.5 rounded-md hover:bg-white/5 text-slate-600 hover:text-white transition-all active:scale-95"
                    aria-label="Copy to Clipboard"
                >
                    {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
            </div>

            {/* Code Content */}
            <div className="p-6 overflow-x-auto custom-scrollbar">
                <pre className="text-sm font-mono leading-relaxed text-slate-300">
                    <code className={`language-${language}`}>
                        {code.split('\n').map((line, i) => (
                            <div key={i} className="flex gap-4 hover:bg-white/5 px-2 -mx-2 rounded transition-colors group/line">
                                <span className="w-6 shrink-0 text-slate-700 text-right select-none group-hover/line:text-slate-500">{i + 1}</span>
                                <span>{line}</span>
                            </div>
                        ))}
                    </code>
                </pre>
            </div>
            
            {/* Security Footer */}
            <div className="px-4 py-2 border-t border-white/5 bg-black/40 flex items-center gap-2">
                <div className="w-1 h-1 rounded-full bg-blue-500 animate-pulse" />
                <span className="text-[9px] font-mono text-slate-600 uppercase tracking-widest">Secure Data Stream Validated</span>
            </div>
        </div>
    )
}
