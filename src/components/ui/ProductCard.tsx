
import React from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import CategoryBadge from './CategoryBadge';

export type Product = {
  id: string;
  name: string;
  category: 'Subscription' | 'Gift Card' | 'Game Credit';
  price: number;
  image: string;
};

const ProductCard: React.FC<{ product: Product }> = ({ product }) => {
  return (
    <Card className="overflow-hidden transition-all duration-300 hover:shadow-lg animate-fade-in">
      <div className="aspect-square relative overflow-hidden bg-gray-100">
        <img 
          src={product.image} 
          alt={product.name} 
          className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
        />
      </div>
      
      <CardContent className="p-4">
        <div className="flex justify-between items-start mb-2">
          <h3 className="font-medium text-gray-900 line-clamp-1">{product.name}</h3>
          <CategoryBadge category={product.category} />
        </div>
        <p className="text-lg font-semibold text-bullion-purple">
          GHS {product.price.toFixed(2)}
        </p>
      </CardContent>
      
      <CardFooter className="p-4 pt-0">
        <Button asChild className="w-full bg-gradient-bullion hover:opacity-90">
          <Link to={`/product/${product.id}`}>
            View Details
          </Link>
        </Button>
      </CardFooter>
    </Card>
  );
};

export default ProductCard;
