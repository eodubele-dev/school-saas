export default function DomainLayout({
    children,
    params,
}: {
    children: React.ReactNode,
    params: { domain: string }
}) {
    // DEBUG FORCE CRASH in Layout
    // throw new Error(`DOMAIN LAYOUT HIT! Domain: ${params.domain}`)
    console.log("Domain Layout Hit")

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
            {children}
        </div>
    )
}
