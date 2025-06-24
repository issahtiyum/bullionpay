
import React from 'react';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';

interface ProductStatusToggleProps {
  isActive: boolean;
  onStatusChange: (isActive: boolean) => void;
}

const ProductStatusToggle: React.FC<ProductStatusToggleProps> = ({
  isActive,
  onStatusChange,
}) => {
  return (
    <div className="flex items-center space-x-2">
      <Switch
        id="is_active"
        checked={isActive}
        onCheckedChange={onStatusChange}
      />
      <Label htmlFor="is_active">Active</Label>
    </div>
  );
};

export default ProductStatusToggle;
