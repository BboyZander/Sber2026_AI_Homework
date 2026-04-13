import { LandingBackground } from "@/components/landing/LandingBackground";
import { LandingBenefits } from "@/components/landing/LandingBenefits";
import { LandingDemoDisclaimer } from "@/components/landing/LandingDemoDisclaimer";
import { LandingFooter } from "@/components/landing/LandingFooter";
import { LandingHeader } from "@/components/landing/LandingHeader";
import { LandingHero } from "@/components/landing/LandingHero";
import { LandingHowItWorks } from "@/components/landing/LandingHowItWorks";
import { LandingRoles } from "@/components/landing/LandingRoles";

export default function LandingPage() {
  return (
    <>
      <LandingBackground />
      <LandingHeader />
      <main className="relative">
        <LandingHero />
        <LandingHowItWorks />
        <LandingBenefits />
        <LandingRoles />
        <LandingDemoDisclaimer />
      </main>
      <LandingFooter />
    </>
  );
}
