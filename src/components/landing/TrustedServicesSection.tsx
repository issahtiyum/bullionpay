
import React from 'react';
import CompanyLogo from './CompanyLogo';

const TrustedServicesSection = () => {
  const logos = [
    { name: 'Netflix' },
    { name: 'YouTube' },
    { name: 'Spotify' },
    { name: 'Steam' },
    { name: 'Apple' },
    { name: 'Snapchat' },
    { name: 'PlayStation' },
  ];

  return (
    <section className="py-20 bg-gray-50">
      <div className="container mx-auto px-4">
        <h2 className="text-lg md:text-xl font-inter font-light text-center mb-16 text-bullion-purple tracking-wide uppercase">
          Working with the best companies in the world
        </h2>
        
        <div className="overflow-hidden">
          <div className="flex animate-scroll">
            {/* First set of logos */}
            {logos.map((logo, index) => (
              <div key={index} className="flex-shrink-0 mx-8 flex items-center justify-center">
                <CompanyLogo name={logo.name} />
              </div>
            ))}
            {/* Duplicate set for seamless loop */}
            {logos.map((logo, index) => (
              <div key={`duplicate-${index}`} className="flex-shrink-0 mx-8 flex items-center justify-center">
                <CompanyLogo name={logo.name} />
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default TrustedServicesSection;
