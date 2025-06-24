
import React from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import CategoryBadge from './CategoryBadge';
import { Database } from '@/integrations/supabase/types';

export type Product = Database['public']['Tables']['products']['Row'];

const ProductCard: React.FC<{ product: Product }> = ({ product }) => {
  return (
    <Card className="overflow-hidden transition-all duration-300 hover:shadow-lg animate-fade-in w-full">
      <div className="aspect-square relative overflow-hidden bg-gray-100">
        <img 
          src={product.image || '/placeholder.svg'} 
          alt={product.name} 
          className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
        />
      </div>
      
      <CardContent className="p-2 sm:p-3">
        <div className="flex justify-between items-start mb-1 sm:mb-2">
          <h3 className="font-medium text-gray-900 line-clamp-1 mr-2 text-sm sm:text-base">{product.name}</h3>
          <CategoryBadge category={product.category} />
        </div>
        <p className="text-base sm:text-lg font-semibold text-bullion-purple">
          GHS {Number(product.price).toFixed(2)}
        </p>
      </CardContent>
      
      <CardFooter className="p-2 sm:p-3 pt-0">
        <Button asChild className="w-full bg-gradient-bullion hover:opacity-90 text-xs sm:text-sm py-1 sm:py-2">
          <Link to={`/product/${product.id}`}>
            View Details
          </Link>
        </Button>
      </CardFooter>
    </Card>
  );
};

export default ProductCard;
