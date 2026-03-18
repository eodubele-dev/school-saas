"use client"

import { useState, useEffect } from "react"
import { check } from "@tauri-apps/plugin-updater"
import { getVersion } from "@tauri-apps/api/app"
import { relaunch } from "@tauri-apps/plugin-process"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { RefreshCw, Download, Rocket, ShieldCheck, CheckCircle2, AlertCircle, Loader2 } from "lucide-react"
import { toast } from "sonner"
import { isDesktop } from "@/lib/utils/desktop"
import { motion, AnimatePresence } from "framer-motion"

/**
 * Strategic Update Orchestrator (Platinum Elite) 🤙🏾🚀🛡️
 * Manages the evolution of the EduFlow workstation.
 */
export function SystemUpdate() {
    const [currentVersion, setCurrentVersion] = useState<string>("...")
    const [isChecking, setIsChecking] = useState(false)
    const [updateAvailable, setUpdateAvailable] = useState<any>(null)
    const [downloadProgress, setDownloadProgress] = useState(0)
    const [status, setStatus] = useState<'idle' | 'checking' | 'available' | 'downloading' | 'ready' | 'error'>('idle')
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        if (isDesktop()) {
            getVersion().then(setCurrentVersion)
        }
    }, [])

    const checkForUpdates = async () => {
        if (!isDesktop()) return
        
        setIsChecking(true)
        setStatus('checking')
        setError(null)
        
        try {
            console.log("Update Orchestrator: Piercing the veil for new versions... 🤙🏾🔍")
            const update = await check()
            
            if (update) {
                console.log("Update Found:", update.version)
                setUpdateAvailable(update)
                setStatus('available')
                toast.success(`Platinum Evolution Detected: v${update.version} is ready!`)
            } else {
                setStatus('idle')
                toast.info("System is Optimized. You are running the latest Platinum core. 🤙🏾💎")
            }
        } catch (err: any) {
            console.error("Update Check Failed:", err)
            setError(err.message || "Failed to contact update server.")
            setStatus('error')
        } finally {
            setIsChecking(false)
        }
    }

    const installUpdate = async () => {
        if (!updateAvailable) return
        
        setStatus('downloading')
        setDownloadProgress(0)
        
        try {
            console.log("Update Orchestrator: Commencing Platinum Infusion... 🤙🏾💉")
            
            let downloadedLength = 0;
            let contentLength = 0;

            await updateAvailable.downloadAndInstall((event: any) => {
                switch (event.event) {
                    case 'Started':
                        contentLength = event.data.contentLength;
                        console.log(`started downloading ${event.data.contentLength} bytes`);
                        break;
                    case 'Progress':
                        downloadedLength += event.data.chunkLength;
                        const progress = (downloadedLength / contentLength) * 100;
                        setDownloadProgress(progress);
                        console.log(`downloaded ${downloadedLength} from ${contentLength}`);
                        break;
                    case 'Finished':
                        console.log('download finished');
                        setStatus('ready')
                        toast.success("Platinum Infusion Complete. Restart required to apply changes. 🤙🏾⚡")
                        break;
                }
            })
        } catch (err: any) {
            console.error("Installation Failed:", err)
            setError(err.message || "Failed to download update.")
            setStatus('error')
            toast.error("Platinum Infusion Interrupted.")
        }
    }

    return (
        <Card className="bg-slate-900/40 border-white/5 backdrop-blur-sm overflow-hidden relative group md:col-span-2">
            {/* Background Aesthetic */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 rounded-full blur-3xl -z-10 group-hover:bg-blue-500/10 transition-colors" />
            
            <CardHeader className="flex flex-row items-center justify-between pb-2">
                <div className="flex items-center gap-4">
                    <div className={StatusColorMap[status].bg}>
                        <RefreshCw className={`h-6 w-6 ${StatusColorMap[status].text} ${isChecking ? 'animate-spin' : ''}`} />
                    </div>
                    <div>
                        <CardTitle className="text-white">Strategic Update Orchestrator</CardTitle>
                        <CardDescription className="text-slate-400">
                            Current Version: <span className="text-blue-400 font-mono">v{currentVersion}</span>
                        </CardDescription>
                    </div>
                </div>
                
                {status === 'idle' && (
                    <Button 
                        variant="outline" 
                        size="sm" 
                        className="bg-white/5 border-white/10 hover:bg-white/10 text-white gap-2"
                        onClick={checkForUpdates}
                        disabled={isChecking}
                    >
                        {isChecking ? <Loader2 size={14} className="animate-spin" /> : <RefreshCw size={14} />}
                        Check for Updates
                    </Button>
                )}
            </CardHeader>

            <CardContent className="pt-4">
                <AnimatePresence mode="wait">
                    {status === 'available' && (
                        <motion.div 
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            className="space-y-4"
                        >
                            <div className="p-4 bg-blue-500/10 border border-blue-500/20 rounded-2xl flex items-start gap-4">
                                <Rocket className="h-10 w-10 text-blue-400 shrink-0 mt-1" />
                                <div className="space-y-1">
                                    <h4 className="text-blue-100 font-bold">New Version Available: v{updateAvailable.version}</h4>
                                    <p className="text-blue-400/80 text-xs">
                                        This update contains critical performance enhancements and new Platinum-grade features for your workstation.
                                    </p>
                                </div>
                                <Button 
                                    className="ml-auto bg-blue-600 hover:bg-blue-500 text-white font-bold gap-2"
                                    onClick={installUpdate}
                                >
                                    <Download size={16} />
                                    Install Now
                                </Button>
                            </div>
                        </motion.div>
                    )}

                    {status === 'downloading' && (
                        <motion.div 
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="space-y-4"
                        >
                            <div className="space-y-2">
                                <div className="flex justify-between text-xs font-bold text-slate-400 uppercase tracking-widest">
                                    <span>Downloading Platinum Core...</span>
                                    <span>{Math.round(downloadProgress)}%</span>
                                </div>
                                <Progress value={downloadProgress} className="h-2 bg-slate-800" />
                            </div>
                        </motion.div>
                    )}

                    {status === 'ready' && (
                        <motion.div 
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="p-4 bg-green-500/10 border border-green-500/20 rounded-2xl flex items-center justify-between"
                        >
                            <div className="flex items-center gap-4">
                                <CheckCircle2 className="h-8 w-8 text-green-400" />
                                <div className="space-y-0.5">
                                    <h4 className="text-green-100 font-bold uppercase text-xs tracking-widest">Update Ready</h4>
                                    <p className="text-green-400/80 text-[10px]">Workstation evolution complete. Restart required.</p>
                                </div>
                            </div>
                            <Button 
                                className="bg-green-600 hover:bg-green-500 text-white font-black uppercase text-xs tracking-tighter"
                                onClick={() => relaunch()}
                            >
                                Relaunch Now
                            </Button>
                        </motion.div>
                    )}

                    {status === 'error' && (
                        <motion.div 
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl flex items-center gap-3 text-red-400 text-xs"
                        >
                            <AlertCircle size={16} />
                            <span>{error}</span>
                            <button className="underline ml-auto font-bold" onClick={checkForUpdates}>Retry</button>
                        </motion.div>
                    )}
                </AnimatePresence>

                {status === 'idle' && (
                    <div className="flex items-center gap-2 text-[10px] text-slate-500 font-bold uppercase tracking-[0.2em] mt-2">
                        <CheckCircle2 size={12} className="text-green-500/50" />
                        System Integrity Confirmed
                    </div>
                )}
            </CardContent>
        </Card>
    )
}

const StatusColorMap: Record<string, { bg: string, text: string }> = {
    idle: { bg: "h-12 w-12 bg-slate-500/10 rounded-xl flex items-center justify-center border border-slate-500/20", text: "text-slate-400" },
    checking: { bg: "h-12 w-12 bg-blue-500/10 rounded-xl flex items-center justify-center border border-blue-500/20", text: "text-blue-400" },
    available: { bg: "h-12 w-12 bg-amber-500/10 rounded-xl flex items-center justify-center border border-amber-500/20", text: "text-amber-400" },
    downloading: { bg: "h-12 w-12 bg-blue-500/10 rounded-xl flex items-center justify-center border border-blue-500/20", text: "text-blue-400" },
    ready: { bg: "h-12 w-12 bg-green-500/10 rounded-xl flex items-center justify-center border border-green-500/20", text: "text-green-400" },
    error: { bg: "h-12 w-12 bg-red-500/10 rounded-xl flex items-center justify-center border border-red-500/20", text: "text-red-400" },
}
