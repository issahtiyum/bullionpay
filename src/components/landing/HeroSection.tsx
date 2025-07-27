
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';

const HeroSection = () => {
  const [currentItem, setCurrentItem] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const rotatingItems = ['Netflix', 'Spotify', 'Amazon', 'Shein', 'Apple Music', 'PlayStation'];

  useEffect(() => {
    const interval = setInterval(() => {
      setIsAnimating(true);
      setTimeout(() => {
        setCurrentItem((prev) => (prev + 1) % rotatingItems.length);
        setIsAnimating(false);
      }, 300); // Half of the animation duration
    }, 2500); // 2.5 seconds between switches

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
      className="relative min-h-screen flex items-center justify-center px-4 text-center"
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
          <h1 className="text-4xl md:text-6xl font-bold mb-4 leading-tight">
            <span className="font-inter text-black">Pay for </span>
            <span className="relative inline-block h-16 md:h-20 overflow-hidden">
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                {rotatingItems.map((item, index) => (
                  <span
                    key={index}
                    className={`font-poppins text-black relative z-10 absolute transition-all duration-600 ease-in-out ${
                      index === currentItem
                        ? isAnimating
                          ? 'transform -translate-y-full opacity-0'
                          : 'transform translate-y-0 opacity-100'
                        : index === (currentItem + 1) % rotatingItems.length
                        ? isAnimating
                          ? 'transform translate-y-0 opacity-100'
                          : 'transform translate-y-full opacity-0'
                        : 'transform translate-y-full opacity-0'
                    }`}
                  >
                    {item}
                  </span>
                ))}
              </div>
              <div className="absolute inset-0 -z-10 bg-bullion-purple/30 rounded-full transform -rotate-1 scale-110"></div>
            </span>
            <br />
            <span className="font-inter text-black">using </span>
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
