
import React from 'react';
import Marquee from 'react-fast-marquee';
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
    <section className="py-20 bg-white">
      <div className="container mx-auto px-4">
        <h2 className="text-sm md:text-base font-inter font-light text-center mb-16 text-gray-600 tracking-wide uppercase">
          Working with the best companies in the world
        </h2>
        
        <Marquee
          speed={50}
          gradient={false}
          pauseOnHover={true}
          direction="left"
        >
          {logos.map((logo, index) => (
            <div key={index} className="mx-12 flex items-center justify-center">
              <CompanyLogo name={logo.name} />
            </div>
          ))}
        </Marquee>
      </div>
    </section>
  );
};

export default TrustedServicesSection;
