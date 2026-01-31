import { Navbar } from "@/components/landing/navbar"
import { HeroSection } from "@/components/landing/hero"
import { StatsSection } from "@/components/landing/stats"
import { FeaturesGrid } from "@/components/landing/features"
import { Testimonials } from "@/components/landing/testimonials"
import { PricingTable } from "@/components/landing/pricing"
import { Footer } from "@/components/landing/footer"
import dynamic from "next/dynamic"
import type { Metadata } from "next"

// Lazy load the AI Demo component
const AiDemoSection = dynamic(() => import("@/components/landing/ai-demo").then(mod => mod.AiDemo), {
  loading: () => <div className="h-96 w-full flex items-center justify-center text-slate-500">Loading AI Experience...</div>,
  ssr: false // Client-side interaction only
})

export const metadata: Metadata = {
  title: "LANDING PAGE HIT - DEBUG",
  description: "Empowering Nigerian schools with offline-first gradebooks, AI report cards, and GPS attendance. The best school software for Lagos, Abuja, and Port Harcourt.",
  keywords: ["School Management System Nigeria", "EduCare", "Offline Gradebook", "School Software Lagos", "CBT Software Nigeria", "School ERP Abuja"],
  openGraph: {
    title: "EduCare - Transforming African Education",
    description: "All-in-one platform for modern schools. Offline-first, AI-powered, and affordable.",
    type: "website",
    locale: "en_NG",
  },
}

export default function LandingPage() {
  console.log("!!! ATTENTION: LANDING PAGE (app/page.tsx) IS RENDERING !!!")
  return (
    <div className="min-h-screen bg-black selection:bg-neon-purple selection:text-white">
      <Navbar />
      <main>
        <HeroSection />
        <StatsSection />
        <FeaturesGrid />
        <AiDemoSection />
        <Testimonials />
        <PricingTable />
      </main>
      <Footer />
    </div>
  )
}
