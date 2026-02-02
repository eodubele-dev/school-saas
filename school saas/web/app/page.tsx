import { Navbar } from "@/components/landing/navbar"
import { HeroOrbit } from "@/components/landing/hero-orbit" // [NEW] Orbit Hero
import { ValueBento } from "@/components/landing/value-bento"
import { VisualProofSection } from "@/components/landing/visual-proof-section"
import { FeeCalculator } from "@/components/landing/fee-calculator"
import { ResultVideo } from "@/components/landing/result-video"
import { PricingTable } from "@/components/landing/pricing"
import { Testimonials } from "@/components/landing/testimonials"
import { Footer } from "@/components/landing/footer"
import { GlowCursor } from "@/components/landing/ui/glow-cursor" // [NEW] Glow
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "EduFlow - The Operating System for Top 1% Schools",
  description: "Eliminate fee leakage, automate NERDC report cards, and give parents a world-class experience. Offline-first school management for Nigeria.",
  keywords: ["School Management System Nigeria", "EduFlow", "Offline Gradebook", "School Software Lagos", "CBT Software Nigeria", "School ERP Abuja"],
  openGraph: {
    title: "EduFlow - The Operating System for Top 1% Schools",
    description: "Eliminate fee leakage and automate report cards. Offline-first and AI-powered.",
    type: "website",
    locale: "en_NG",
  },
}

import { LogoStrip } from "@/components/landing/logo-strip" // [NEW]

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#020410] selection:bg-blue-500 selection:text-white overflow-hidden relative">
      <GlowCursor />
      <Navbar />
      <main className="relative z-10 space-y-32 pb-32">
        <HeroOrbit />
        <LogoStrip />
        <ValueBento />
        <VisualProofSection />
        <FeeCalculator />
        <ResultVideo />
        <Testimonials />
        <PricingTable />
      </main>
      <Footer />
    </div>
  )
}
