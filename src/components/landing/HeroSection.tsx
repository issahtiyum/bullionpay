
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';

const HeroSection = () => {
  const [currentItem, setCurrentItem] = useState(0);
  const rotatingItems = ['Netflix', 'Spotify', 'Amazon', 'Shein', 'Apple Music', 'PlayStation'];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentItem((prev) => (prev + 1) % rotatingItems.length);
    }, 2000);

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
      className="relative py-20 px-4 text-center"
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
            <span className="font-poppins text-black">Pay for </span>
            <span className="relative inline-block">
              <span className="font-poppins text-black relative z-10">
                {rotatingItems[currentItem]}
              </span>
              <div className="absolute inset-0 -z-10 bg-bullion-purple/30 rounded-full transform -rotate-1 scale-110"></div>
            </span>
            <br />
            <span className="font-poppins text-black">using </span>
            <span className="font-playfair text-bullion-purple">Mobile Money</span>
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
