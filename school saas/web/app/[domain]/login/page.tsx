import { LoginForm } from "@/components/auth/login-form"
import { headers } from "next/headers"


export default function LoginPage({
    params,
    searchParams
}: {
    params: { domain: string },
    searchParams: { email?: string }
}) {
    const headerList = headers()

    // Read branding from headers injected by middleware
    const schoolName = headerList.get('x-school-name') || undefined
    const logoUrl = headerList.get('x-school-logo') || undefined
    const rawThemeConfig = headerList.get('x-school-theme')

    let primaryColor = undefined
    if (rawThemeConfig) {
        try {
            const theme = JSON.parse(rawThemeConfig)
            primaryColor = theme.primary
        } catch (e) {
            console.error("Failed to parse theme config header", e)
        }
    }

    return (
        <LoginForm
            domain={params.domain}
            schoolName={schoolName}
            logoUrl={logoUrl}
            primaryColor={primaryColor}
            initialEmail={searchParams?.email}
        />
    )
}
