
import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useIsMobile } from '@/hooks/use-mobile';

const LandingNavbar = () => {
  const isMobile = useIsMobile();
  
  return (
    <nav className="bg-bullion-purple text-white shadow-md">
      <div className="container mx-auto px-4 py-3 flex justify-between items-center">
        <Link to="/" className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center">
            <span className="text-bullion-purple font-bold text-lg">BP</span>
          </div>
        </Link>
        
        <div className="flex items-center gap-2 sm:gap-4">
          <Link 
            to="/login?tab=login" 
            className="hover:text-bullion-purple-100 transition-colors px-3 py-1 rounded font-poppins text-sm sm:text-base"
          >
            Login
          </Link>
          <Button 
            asChild
            className="bg-white text-bullion-purple hover:bg-gray-100 font-poppins font-medium text-sm sm:text-base px-3 py-1 sm:px-4 sm:py-2"
          >
            <Link to="/login?tab=signup">
              Get Started
            </Link>
          </Button>
        </div>
      </div>
    </nav>
  );
};

export default LandingNavbar;
