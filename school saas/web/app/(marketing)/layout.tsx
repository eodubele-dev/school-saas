import { ExecutiveConversionProvider } from "@/components/landing/executive-context"
import { ExecutiveModals } from "@/components/landing/executive-modals"
import { MegaMenu } from "@/components/landing/mega-menu"
import { PhysicalDemoModal } from "@/components/landing/physical-demo-modal"
import { SupportSlideOver } from "@/components/landing/support-slide-over"
import { ExecutiveFocusGlow } from "@/components/landing/executive-focus-glow"

export default function MarketingLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <ExecutiveConversionProvider>
      {children}
      <ExecutiveModals />
      <MegaMenu />
      <PhysicalDemoModal />
      <SupportSlideOver />
      <ExecutiveFocusGlow />
    </ExecutiveConversionProvider>
  )
}
