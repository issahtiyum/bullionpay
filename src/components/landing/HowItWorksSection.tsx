
import React from 'react';
import { Search, Smartphone, Zap } from 'lucide-react';

const HowItWorksSection = () => {
  const steps = [
    {
      icon: <Search className="w-12 h-12 text-bullion-purple" />,
      title: 'Choose a service',
      description: 'Select the subscription or product you want.'
    },
    {
      icon: <Smartphone className="w-12 h-12 text-bullion-purple" />,
      title: 'Pay with mobile money',
      description: 'Authorize payment easily.'
    },
    {
      icon: <Zap className="w-12 h-12 text-bullion-purple" />,
      title: 'Get instant access',
      description: 'Receive your login or code immediately.'
    }
  ];

  return (
    <section id="how-it-works" className="py-20 bg-white">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl md:text-4xl font-bold text-center mb-16 text-bullion-purple font-poppins">
          How It Works
        </h2>
        
        <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
          {steps.map((step, index) => (
            <div key={index} className="text-center">
              <div className="flex justify-center mb-6">
                <div className="w-20 h-20 bg-bullion-purple/10 rounded-full flex items-center justify-center">
                  {step.icon}
                </div>
              </div>
              <h3 className="text-xl font-bold mb-4 text-gray-900 font-poppins">
                {step.title}
              </h3>
              <p className="text-gray-600 font-inter">
                {step.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HowItWorksSection;
