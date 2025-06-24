
import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { CustomField } from '@/components/admin/CustomFieldsManager';

interface CustomFieldsFormProps {
  fields: CustomField[];
  values: Record<string, string>;
  onChange: (fieldId: string, value: string) => void;
  errors: Record<string, string>;
}

const CustomFieldsForm: React.FC<CustomFieldsFormProps> = ({ 
  fields, 
  values, 
  onChange, 
  errors 
}) => {
  if (!fields || fields.length === 0) {
    return null;
  }

  const renderField = (field: CustomField) => {
    const value = values[field.id] || '';
    const error = errors[field.id];
    
    const baseInputProps = {
      id: field.id,
      value,
      onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => 
        onChange(field.id, e.target.value),
      placeholder: field.placeholder,
      required: field.required,
      className: `border-purple-200 focus:border-purple-400 focus:ring-purple-200 bg-purple-50 ${
        error ? 'border-red-400' : ''
      }`,
    };

    return (
      <div key={field.id} className="space-y-2">
        <Label 
          htmlFor={field.id} 
          className="text-sm font-medium text-purple-700"
        >
          {field.label}
          {field.required && <span className="text-red-500 ml-1">*</span>}
        </Label>
        
        {field.type === 'textarea' ? (
          <Textarea
            {...baseInputProps}
            rows={3}
          />
        ) : (
          <Input
            {...baseInputProps}
            type={field.type}
          />
        )}
        
        {error && (
          <p className="text-sm text-red-600">{error}</p>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-4 p-4 border border-purple-200 rounded-lg bg-purple-50">
      <div className="flex items-center gap-2 mb-3">
        <div className="w-2 h-2 bg-purple-600 rounded-full"></div>
        <h3 className="font-medium text-purple-800">Additional Information Required</h3>
      </div>
      
      <div className="space-y-4">
        {fields.map(renderField)}
      </div>
      
      <p className="text-xs text-purple-600 italic">
        This information is required to process your order for this service.
      </p>
    </div>
  );
};

export default CustomFieldsForm;
