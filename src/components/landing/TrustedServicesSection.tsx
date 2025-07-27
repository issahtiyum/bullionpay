
import React from 'react';

const TrustedServicesSection = () => {
  const logos = [
    { name: 'Amazon', width: 100 },
    { name: 'Netflix', width: 100 },
    { name: 'YouTube', width: 100 },
    { name: 'Spotify', width: 100 },
    { name: 'Xbox', width: 80 },
    { name: 'Steam', width: 100 },
    { name: 'Apple', width: 80 },
  ];

  return (
    <section className="py-16 bg-gray-50">
      <div className="container mx-auto px-4">
        <h2 className="text-2xl md:text-3xl font-bold text-center mb-12 text-bullion-purple uppercase tracking-wide">
          Trusted by leading teams
        </h2>
        
        <div className="overflow-hidden">
          <div className="flex animate-scroll">
            {/* First set of logos */}
            {logos.map((logo, index) => (
              <div key={index} className="flex-shrink-0 mx-8 flex items-center justify-center">
                <div className="w-24 h-12 bg-gray-400 rounded flex items-center justify-center">
                  <span className="text-white font-medium text-sm">{logo.name}</span>
                </div>
              </div>
            ))}
            {/* Duplicate set for seamless loop */}
            {logos.map((logo, index) => (
              <div key={`duplicate-${index}`} className="flex-shrink-0 mx-8 flex items-center justify-center">
                <div className="w-24 h-12 bg-gray-400 rounded flex items-center justify-center">
                  <span className="text-white font-medium text-sm">{logo.name}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default TrustedServicesSection;
