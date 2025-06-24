import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Trash2, Plus } from 'lucide-react';

export type CustomField = {
  id: string;
  label: string;
  type: 'text' | 'email' | 'password' | 'number' | 'textarea';
  required: boolean;
  placeholder: string;
};

interface CustomFieldsManagerProps {
  fields: CustomField[];
  onChange: (fields: CustomField[]) => void;
}

const CustomFieldsManager: React.FC<CustomFieldsManagerProps> = ({ fields, onChange }) => {
  const [newField, setNewField] = useState<CustomField>({
    id: '',
    label: '',
    type: 'text',
    required: false,
    placeholder: '',
  });

  const addField = () => {
    if (!newField.label.trim()) return;
    
    const fieldId = newField.label.toLowerCase().replace(/\s+/g, '_');
    const field = { ...newField, id: fieldId };
    
    onChange([...fields, field]);
    setNewField({
      id: '',
      label: '',
      type: 'text',
      required: false,
      placeholder: '',
    });
  };

  const removeField = (index: number) => {
    const updatedFields = fields.filter((_, i) => i !== index);
    onChange(updatedFields);
  };

  const updateField = (index: number, updates: Partial<CustomField>) => {
    const updatedFields = fields.map((field, i) => 
      i === index ? { ...field, ...updates } : field
    );
    onChange(updatedFields);
  };

  return (
    <div className="space-y-4">
      <Label className="text-sm font-medium">Custom Fields for Checkout</Label>
      
      {/* Existing Fields */}
      {fields.map((field, index) => (
        <Card key={index} className="border border-purple-200 bg-purple-50">
          <CardContent className="p-4">
            <div className="grid grid-cols-2 gap-3 mb-3">
              <div>
                <Label className="text-xs">Field Label</Label>
                <Input
                  value={field.label}
                  onChange={(e) => updateField(index, { label: e.target.value })}
                  className="h-8 text-sm"
                />
              </div>
              <div>
                <Label className="text-xs">Field Type</Label>
                <Select 
                  value={field.type} 
                  onValueChange={(value) => updateField(index, { type: value as CustomField['type'] })}
                >
                  <SelectTrigger className="h-8 text-sm">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="text">Text</SelectItem>
                    <SelectItem value="email">Email</SelectItem>
                    <SelectItem value="password">Password</SelectItem>
                    <SelectItem value="number">Number</SelectItem>
                    <SelectItem value="textarea">Textarea</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div className="mb-3">
              <Label className="text-xs">Placeholder Text</Label>
              <Input
                value={field.placeholder}
                onChange={(e) => updateField(index, { placeholder: e.target.value })}
                placeholder="Enter placeholder text..."
                className="h-8 text-sm"
              />
            </div>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Switch
                  checked={field.required}
                  onCheckedChange={(checked) => updateField(index, { required: checked })}
                />
                <Label className="text-xs">Required field</Label>
              </div>
              <Button
                size="sm"
                variant="outline"
                onClick={() => removeField(index)}
                className="h-7 px-2"
              >
                <Trash2 className="w-3 h-3" />
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}

      {/* Add New Field */}
      <Card className="border-dashed border-gray-300">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm">Add New Field</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className="text-xs">Field Label</Label>
              <Input
                value={newField.label}
                onChange={(e) => setNewField({ ...newField, label: e.target.value })}
                placeholder="e.g., Netflix Email"
                className="h-8 text-sm"
              />
            </div>
            <div>
              <Label className="text-xs">Field Type</Label>
              <Select 
                value={newField.type} 
                onValueChange={(value) => setNewField({ ...newField, type: value as CustomField['type'] })}
              >
                <SelectTrigger className="h-8 text-sm">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="text">Text</SelectItem>
                  <SelectItem value="email">Email</SelectItem>
                  <SelectItem value="password">Password</SelectItem>
                  <SelectItem value="number">Number</SelectItem>
                  <SelectItem value="textarea">Textarea</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <div>
            <Label className="text-xs">Placeholder Text</Label>
            <Input
              value={newField.placeholder}
              onChange={(e) => setNewField({ ...newField, placeholder: e.target.value })}
              placeholder="Enter placeholder text..."
              className="h-8 text-sm"
            />
          </div>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Switch
                checked={newField.required}
                onCheckedChange={(checked) => setNewField({ ...newField, required: checked })}
              />
              <Label className="text-xs">Required field</Label>
            </div>
            <Button
              size="sm"
              onClick={addField}
              disabled={!newField.label.trim()}
              className="h-7 px-3"
            >
              <Plus className="w-3 h-3 mr-1" />
              Add Field
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default CustomFieldsManager;
