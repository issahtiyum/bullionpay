
import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Database } from '@/integrations/supabase/types';
import CustomFieldsManager, { CustomField } from './CustomFieldsManager';
import BasicProductInfo from './product-form/BasicProductInfo';
import ProductImageManager from './product-form/ProductImageManager';
import ProductDescriptionField from './product-form/ProductDescriptionField';
import ProductStatusToggle from './product-form/ProductStatusToggle';

type Product = Database['public']['Tables']['products']['Row'];
type ProductCategory = Database['public']['Enums']['product_category'];

interface ProductFormProps {
  product?: Product;
  onSubmit: (data: any) => void;
  onCancel: () => void;
  isSubmitting: boolean;
}

const ProductForm: React.FC<ProductFormProps> = ({ product, onSubmit, onCancel, isSubmitting }) => {
  const [formData, setFormData] = useState({
    name: product?.name || '',
    category: product?.category || 'Subscription' as ProductCategory,
    price: product?.price?.toString() || '',
    image: product?.image || '/placeholder.svg',
    description: product?.description || '',
    is_active: product?.is_active ?? true,
    custom_fields: (product?.custom_fields as CustomField[]) || [],
  });

  const [imageFile, setImageFile] = useState<File | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // If uploading a file, convert to base64 for now
    // In a real app, you'd upload to storage and get the URL
    if (imageFile) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const base64 = e.target?.result as string;
        onSubmit({
          ...formData,
          price: parseFloat(formData.price),
          image: base64,
        });
      };
      reader.readAsDataURL(imageFile);
    } else {
      onSubmit({
        ...formData,
        price: parseFloat(formData.price),
      });
    }
  };

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{product ? 'Edit Product' : 'Add New Product'}</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <BasicProductInfo
            name={formData.name}
            category={formData.category}
            price={formData.price}
            onInputChange={handleInputChange}
          />

          <ProductImageManager
            image={formData.image}
            onImageChange={(image) => handleInputChange('image', image)}
            onFileChange={setImageFile}
          />

          <ProductDescriptionField
            description={formData.description}
            onDescriptionChange={(description) => handleInputChange('description', description)}
          />

          <div>
            <CustomFieldsManager
              fields={formData.custom_fields}
              onChange={(fields) => handleInputChange('custom_fields', fields)}
            />
          </div>

          <ProductStatusToggle
            isActive={formData.is_active}
            onStatusChange={(isActive) => handleInputChange('is_active', isActive)}
          />

          <div className="flex gap-2">
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Saving...' : product ? 'Update Product' : 'Create Product'}
            </Button>
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancel
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default ProductForm;
