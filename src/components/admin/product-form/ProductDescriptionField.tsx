
import React from 'react';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

interface ProductDescriptionFieldProps {
  description: string;
  onDescriptionChange: (description: string) => void;
}

const ProductDescriptionField: React.FC<ProductDescriptionFieldProps> = ({
  description,
  onDescriptionChange,
}) => {
  return (
    <div>
      <Label htmlFor="description">Description</Label>
      <Textarea
        id="description"
        value={description}
        onChange={(e) => onDescriptionChange(e.target.value)}
        placeholder="Enter product description"
        rows={3}
      />
    </div>
  );
};

export default ProductDescriptionField;
