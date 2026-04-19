"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import {
  Calculator,
  Calendar,
  CreditCard,
  Settings,
  Smile,
  User,
  Search,
  Command as CommandIcon,
  Shield,
  FileText,
  Zap,
  LayoutDashboard,
  Globe,
  Key,
  Terminal,
  Newspaper
} from "lucide-react"

import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
  CommandShortcut,
} from "@/components/ui/command"

export function DocSearch({ children }: { children?: React.ReactNode }) {
  const [open, setOpen] = React.useState(false)
  const router = useRouter()

  React.useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault()
        setOpen((open) => !open)
      }
    }

    document.addEventListener("keydown", down)
    return () => document.removeEventListener("keydown", down)
  }, [])

  const runCommand = React.useCallback((command: () => void) => {
    setOpen(false)
    command()
  }, [])

  return (
    <>
      <div 
        onClick={() => setOpen(true)}
        className="flex items-center gap-3 px-4 h-10 rounded-xl bg-white/5 border border-white/5 hover:border-blue-500/30 cursor-pointer group transition-all"
      >
        <Search className="w-4 h-4 text-slate-500 group-hover:text-blue-400 transition-colors" />
        <span className="text-sm text-slate-500 flex-1">Search docs...</span>
        <div className="flex items-center gap-1 px-1.5 py-0.5 rounded bg-white/5 border border-white/10">
          <CommandIcon className="w-2.5 h-2.5 text-slate-600" />
          <span className="text-[10px] font-mono text-slate-600 uppercase">K</span>
        </div>
      </div>

      <CommandDialog open={open} onOpenChange={setOpen}>
        <CommandInput placeholder="Type a command or search..." />
        <CommandList className="max-h-[400px]">
          <CommandEmpty>No results found.</CommandEmpty>
          
          <CommandGroup heading="Platform Core">
            <CommandItem onSelect={() => runCommand(() => router.push("/docs"))}>
              <LayoutDashboard className="mr-2 h-4 w-4 text-blue-400" />
              <span>Getting Started</span>
            </CommandItem>
            <CommandItem onSelect={() => runCommand(() => router.push("/docs"))}>
              <Globe className="mr-2 h-4 w-4 text-blue-400" />
              <span>Platform Overview</span>
            </CommandItem>
          </CommandGroup>

          <CommandSeparator />

          <CommandGroup heading="Modules">
            <CommandItem onSelect={() => runCommand(() => router.push("/docs/financial-integrity"))}>
              <CreditCard className="mr-2 h-4 w-4 text-amber-400" />
              <span>Financial Integrity</span>
            </CommandItem>
            <CommandItem onSelect={() => runCommand(() => router.push("/docs/campus-security"))}>
              <Shield className="mr-2 h-4 w-4 text-emerald-400" />
              <span>Forensic Security</span>
            </CommandItem>
          </CommandGroup>

          <CommandSeparator />

          <CommandGroup heading="Developer Resources">
            <CommandItem onSelect={() => runCommand(() => router.push("/docs#architecture"))}>
              <Terminal className="mr-2 h-4 w-4 text-slate-400" />
              <span>Platform Architecture</span>
            </CommandItem>
            <CommandItem onSelect={() => runCommand(() => router.push("/docs#security"))}>
              <Key className="mr-2 h-4 w-4 text-slate-400" />
              <span>Authentication (REST)</span>
            </CommandItem>
            <CommandItem onSelect={() => runCommand(() => router.push("/docs/campus-security#security"))}>
              <Settings className="mr-2 h-4 w-4 text-slate-400" />
              <span>Webhook Protocols</span>
            </CommandItem>
            <CommandItem onSelect={() => runCommand(() => router.push("/docs"))}>
              <Newspaper className="mr-2 h-4 w-4 text-slate-400" />
              <span>System Changelog</span>
            </CommandItem>
          </CommandGroup>
        </CommandList>
      </CommandDialog>
    </>
  )
}
