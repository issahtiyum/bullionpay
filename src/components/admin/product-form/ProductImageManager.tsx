
import React, { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Upload, Link, Image } from 'lucide-react';

interface ProductImageManagerProps {
  image: string;
  onImageChange: (image: string) => void;
  onFileChange: (file: File | null) => void;
}

const ProductImageManager: React.FC<ProductImageManagerProps> = ({
  image,
  onImageChange,
  onFileChange,
}) => {
  const [imageMethod, setImageMethod] = useState<'url' | 'upload'>('url');
  const [imagePreview, setImagePreview] = useState<string>(image);

  const handleImageUrlChange = (url: string) => {
    onImageChange(url);
    setImagePreview(url);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onFileChange(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        setImagePreview(result);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div>
      <Label>Product Image</Label>
      <Tabs value={imageMethod} onValueChange={(value) => setImageMethod(value as 'url' | 'upload')} className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="url" className="flex items-center gap-2">
            <Link size={16} />
            Image URL
          </TabsTrigger>
          <TabsTrigger value="upload" className="flex items-center gap-2">
            <Upload size={16} />
            Upload File
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="url" className="space-y-2">
          <Input
            value={image}
            onChange={(e) => handleImageUrlChange(e.target.value)}
            placeholder="https://example.com/image.jpg or /placeholder.svg"
          />
        </TabsContent>
        
        <TabsContent value="upload" className="space-y-2">
          <div className="flex items-center gap-2">
            <Input
              type="file"
              accept="image/*"
              onChange={handleFileUpload}
              className="file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
            />
          </div>
        </TabsContent>
      </Tabs>
      
      {/* Image Preview */}
      <div className="mt-4">
        <Label>Preview</Label>
        <div className="mt-2 border rounded-lg p-4 bg-gray-50">
          {imagePreview ? (
            <img 
              src={imagePreview} 
              alt="Product preview"
              className="w-32 h-32 object-cover rounded-lg mx-auto"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.src = '/placeholder.svg';
              }}
            />
          ) : (
            <div className="w-32 h-32 bg-gray-200 rounded-lg mx-auto flex items-center justify-center">
              <Image size={32} className="text-gray-400" />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductImageManager;
