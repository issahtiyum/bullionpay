
import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Database } from '@/integrations/supabase/types';

type ProductCategory = Database['public']['Enums']['product_category'];

interface BasicProductInfoProps {
  name: string;
  category: ProductCategory;
  price: string;
  onInputChange: (field: string, value: any) => void;
}

const categories: ProductCategory[] = ['Subscription', 'Gift Card', 'Game Credit'];

const BasicProductInfo: React.FC<BasicProductInfoProps> = ({
  name,
  category,
  price,
  onInputChange,
}) => {
  return (
    <div className="space-y-4">
      <div>
        <Label htmlFor="name">Product Name</Label>
        <Input
          id="name"
          value={name}
          onChange={(e) => onInputChange('name', e.target.value)}
          placeholder="Enter product name"
          required
        />
      </div>

      <div>
        <Label htmlFor="category">Category</Label>
        <Select value={category} onValueChange={(value) => onInputChange('category', value)}>
          <SelectTrigger>
            <SelectValue placeholder="Select category" />
          </SelectTrigger>
          <SelectContent>
            {categories.map((category) => (
              <SelectItem key={category} value={category}>
                {category}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label htmlFor="price">Price (GHS)</Label>
        <Input
          id="price"
          type="number"
          step="0.01"
          min="0"
          value={price}
          onChange={(e) => onInputChange('price', e.target.value)}
          placeholder="0.00"
          required
        />
      </div>
    </div>
  );
};

export default BasicProductInfo;
