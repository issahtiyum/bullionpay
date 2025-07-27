
import React from 'react';
import { Check, Smartphone, Shield, MapPin, CreditCard } from 'lucide-react';

const BenefitsSection = () => {
  const benefits = [
    {
      icon: <Smartphone className="w-8 h-8 text-bullion-purple" />,
      title: 'Works with Mobile Money',
      description: 'Use your MTN, Vodafone, or AirtelTigo mobile money'
    },
    {
      icon: <CreditCard className="w-8 h-8 text-bullion-purple" />,
      title: 'No credit card needed',
      description: 'Skip the hassle of international cards'
    },
    {
      icon: <MapPin className="w-8 h-8 text-bullion-purple" />,
      title: 'Built for Ghana',
      description: 'Designed specifically for Ghanaian users'
    },
    {
      icon: <Shield className="w-8 h-8 text-bullion-purple" />,
      title: 'Secure and encrypted',
      description: 'Your payments and data are protected'
    }
  ];

  return (
    <section className="min-h-screen py-20 bg-gray-50 flex items-center">
      <div className="w-full px-4">
        <h2 className="text-3xl md:text-4xl font-bold text-center mb-16 text-bullion-purple font-poppins">
          Why Bullion Pay?
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {benefits.map((benefit, index) => (
            <div key={index} className="bg-white p-8 rounded-lg shadow-sm text-center">
              <div className="flex justify-center mb-6">
                <div className="w-16 h-16 bg-bullion-purple/10 rounded-full flex items-center justify-center">
                  {benefit.icon}
                </div>
              </div>
              <h3 className="text-lg font-bold mb-4 text-gray-900 font-poppins">
                {benefit.title}
              </h3>
              <p className="text-gray-600 font-inter text-sm">
                {benefit.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default BenefitsSection;
