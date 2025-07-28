
import React from 'react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';

const FinalCTASection = () => {
  return (
    <section className="py-24 bg-bullion-purple">
      <div className="container mx-auto px-4 text-center">
        <h2 className="text-3xl md:text-4xl font-bold mb-10 text-white font-poppins">
          Ready to get started?
        </h2>
        <p className="text-lg text-white/90 mb-12 max-w-2xl mx-auto font-inter">
          Join thousands of Ghanaians who are already using BullionPay to access their favorite digital services.
        </p>
        <Button 
          asChild
          size="lg"
          className="bg-white text-bullion-purple hover:bg-gray-100 font-poppins font-bold text-lg px-10 py-4 rounded-lg"
        >
          <Link to="/all-products">
            GET STARTED TODAY
          </Link>
        </Button>
      </div>
    </section>
  );
};

export default FinalCTASection;
