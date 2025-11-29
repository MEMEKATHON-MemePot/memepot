import CTASection from "./components/CTASection";
import FeaturesSection from "./components/FeaturesSection";
import HeroSection from "./components/HeroSection";

export default function About() {
  return (
    <div className="min-h-screen from-slate-900 via-slate-800 to-slate-900">
      <HeroSection />
      <FeaturesSection />
      <CTASection />
    </div>
  );
}
