import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';

const HeroSection = () => {
  const [currentItem, setCurrentItem] = useState(0);
  const rotatingItems = ['Netflix', 'Spotify', 'Amazon', 'Shein', 'Apple Music', 'PlayStation'];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentItem((prev) => (prev + 1) % rotatingItems.length);
    }, 3000); // 3 seconds between switches

    return () => clearInterval(interval);
  }, []);

  const scrollToHowItWorks = () => {
    const element = document.getElementById('how-it-works');
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section 
      className="relative h-screen flex items-center justify-center px-4 text-center"
      style={{
        backgroundImage: `url('/lovable-uploads/e28a8a0f-6dd3-4fef-aba7-aaaf6a6f34a7.png')`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat'
      }}
    >
      <div className="absolute inset-0 bg-white/60"></div>
      
      <div className="relative z-10 container mx-auto max-w-4xl">
        <div className="mb-8">
          <h1 className="text-4xl md:text-6xl font-bold mb-4 leading-tight flex flex-wrap items-center justify-center gap-x-4">
            <span className="font-inter text-black">Pay for</span>
            <span className="relative inline-block h-[1.2em] overflow-hidden min-w-[200px] md:min-w-[300px]">
              <div className="relative w-full h-full">
                {rotatingItems.map((item, index) => {
                  const isActive = index === currentItem;
                  const isPrevious = index === (currentItem - 1 + rotatingItems.length) % rotatingItems.length;
                  
                  let transformClass = '';
                  let opacityClass = '';
                  
                  if (isActive) {
                    transformClass = 'translate-y-0';
                    opacityClass = 'opacity-100';
                  } else if (isPrevious) {
                    transformClass = '-translate-y-full';
                    opacityClass = 'opacity-0';
                  } else {
                    transformClass = 'translate-y-full';
                    opacityClass = 'opacity-0';
                  }
                  
                  return (
                    <span
                      key={index}
                      className={`font-poppins text-bullion-purple absolute top-0 left-1/2 transform -translate-x-1/2 whitespace-nowrap transition-all duration-1000 ease-in-out ${transformClass} ${opacityClass}`}
                    >
                      {item}
                    </span>
                  );
                })}
              </div>
            </span>
            <span className="font-inter text-black">using</span>
            <span className="font-playfair text-bullion-purple italic">Mobile Money</span>
          </h1>
        </div>
        
        <p className="text-lg md:text-xl text-gray-700 mb-8 max-w-2xl mx-auto font-inter">
          No card? No problem. Use Bullion Pay to access digital services and products using just your Ghanaian mobile money.
        </p>
        
        <Button 
          onClick={scrollToHowItWorks}
          className="bg-bullion-purple hover:bg-bullion-purple/90 text-white font-poppins font-medium text-lg px-8 py-3 rounded-lg"
        >
          Start Now
        </Button>
      </div>
    </section>
  );
};

export default HeroSection;
