import { Navbar } from "@/components/landing/navbar"
import { HeroFlowBuilder } from "@/components/landing/hero-flowbuilder"
import { ForensicTerminal } from "@/components/landing/forensic-terminal"
import { ForensicCampusBento } from "@/components/landing/forensic-campus-bento"
import { RevenueEngineBento } from "@/components/landing/revenue-engine-bento"
import { VisualProofSection } from "@/components/landing/visual-proof-section"
import { FeeCalculator } from "@/components/landing/fee-calculator"
import { ResultVideo } from "@/components/landing/result-video"
import { PricingTable } from "@/components/landing/pricing"
import { GlobalCommandCenter } from "@/components/landing/global-command-center"
import { ForensicFAQ } from "@/components/landing/forensic-faq"
import { FinalCloserCta } from "@/components/landing/final-closer-cta"
import { SocialProofBento } from "@/components/landing/social-proof-bento" // Replaced Testimonials
import { Footer } from "@/components/landing/footer"
import { GlowCursor } from "@/components/landing/ui/glow-cursor"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "EduFlow Platinum | The Operating System for Elite Schools",
  description: "Eliminate paper reports, track campus logistics, and recover up to ₦9M in lost fees with West Africa's most secure school management platform.",
  keywords: ["School Management System Nigeria", "EduFlow", "Offline Gradebook", "School Software Lagos", "CBT Software Nigeria", "School ERP Abuja"],
  openGraph: {
    title: "EduFlow: Total Campus Command & ₦9M Revenue Recovery",
    description: "Forensic-level audit logs, automated fee enforcement, and live campus logistics for top-tier proprietors.",
    type: "website",
    locale: "en_NG",
  },
  twitter: {
    card: "summary_large_image",
    title: "The Future of School Management in Lagos",
    description: "Stop fee leakage and grade tampering. Experience the zero-paper school revolution.",
  }
}

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#000000] selection:bg-blue-500 selection:text-white overflow-hidden relative">
      <GlowCursor />
      <Navbar />
      <main className="relative z-10 space-y-0 pb-32">
        <HeroFlowBuilder />
        <ForensicTerminal />
        <ForensicCampusBento />
        <RevenueEngineBento />
        {/* <VisualProofSection /> */}
        <FeeCalculator />
        <ResultVideo />
        <SocialProofBento />
        <PricingTable />
        <GlobalCommandCenter />
        <ForensicFAQ />
        <FinalCloserCta />
      </main>
      <Footer />
    </div>
  )
}
