
import React from 'react';
import LandingNavbar from './LandingNavbar';
import HeroSection from './HeroSection';
import TrustedServicesSection from './TrustedServicesSection';
import HowItWorksSection from './HowItWorksSection';
import BenefitsSection from './BenefitsSection';
import FinalCTASection from './FinalCTASection';

const LandingPage = () => {
  return (
    <div className="min-h-screen bg-white">
      <LandingNavbar />
      <HeroSection />
      <TrustedServicesSection />
      <HowItWorksSection />
      <BenefitsSection />
      <FinalCTASection />
    </div>
  );
};

export default LandingPage;
