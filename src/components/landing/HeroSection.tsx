
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
      <div className="absolute inset-0 bg-white/30"></div>
      
      <div className="relative z-10 container mx-auto max-w-4xl">
        <div className="mb-8 sm:mb-10">
          <div className="text-3xl sm:text-4xl md:text-6xl font-bold text-center">
            {/* First line: "Pay for" */}
            <div className="leading-tight mb-2 sm:mb-3">
              <span className="font-inter text-black">Pay for</span>
            </div>
            
            {/* Second line: rotating words */}
            <div className="leading-tight mb-2 sm:mb-3">
              <span className="relative inline-block overflow-hidden min-w-[180px] sm:min-w-[250px] md:min-w-[400px] h-[2.5rem] sm:h-[4rem] md:h-[6rem] py-1 sm:py-2">
                <div className="relative w-full h-full flex items-center justify-center">
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
                        className={`font-poppins text-bullion-purple absolute inset-0 flex items-center justify-center whitespace-nowrap transition-all duration-1000 ease-in-out ${transformClass} ${opacityClass}`}
                      >
                        {item}
                      </span>
                    );
                  })}
                </div>
              </span>
            </div>
            
            {/* Third line: "using Mobile Money" - ensuring Mobile Money stays together */}
            <div className="leading-tight">
              <span className="font-inter text-black">using </span>
              <span className="font-playfair text-black font-bold italic whitespace-nowrap text-4xl sm:text-5xl md:text-7xl my-2">Mobile&nbsp;Money</span>
            </div>
          </div>
        </div>
        
        <p className="text-sm sm:text-lg md:text-xl text-gray-700 mb-8 sm:mb-10 max-w-2xl mx-auto font-inter px-2 sm:px-4">
          No card? No problem. Use <span className="font-poppins font-bold">BullionPay</span> to access digital services and products using just your Ghanaian mobile money.
        </p>
        
        <Button 
          onClick={scrollToHowItWorks}
          className="bg-bullion-purple hover:bg-bullion-purple/90 text-white font-poppins font-medium text-sm sm:text-lg px-6 sm:px-12 py-3 sm:py-6 rounded-lg"
        >
          Start Now
        </Button>
      </div>
    </section>
  );
};

export default HeroSection;
