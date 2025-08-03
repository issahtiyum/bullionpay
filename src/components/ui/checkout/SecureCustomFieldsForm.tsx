
import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { CustomField } from '@/components/admin/CustomFieldsManager';
import { sanitizeText, validateInput } from '@/utils/sanitizer';

interface SecureCustomFieldsFormProps {
  fields: CustomField[];
  values: Record<string, string>;
  onChange: (fieldId: string, value: string) => void;
  errors: Record<string, string>;
}

const SecureCustomFieldsForm: React.FC<SecureCustomFieldsFormProps> = ({ 
  fields, 
  values, 
  onChange, 
  errors 
}) => {
  if (!fields || fields.length === 0) {
    return null;
  }

  const handleInputChange = (fieldId: string, rawValue: string, fieldType: string) => {
    // Sanitize input
    const sanitizedValue = sanitizeText(rawValue);
    
    // Validate input
    const isValid = validateInput.customField(sanitizedValue, fieldType);
    
    if (isValid || sanitizedValue === '') {
      onChange(fieldId, sanitizedValue);
    }
  };

  const renderField = (field: CustomField) => {
    const value = values[field.id] || '';
    const error = errors[field.id];
    
    const baseInputProps = {
      id: field.id,
      value,
      onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => 
        handleInputChange(field.id, e.target.value, field.type),
      placeholder: field.placeholder ? sanitizeText(field.placeholder) : '',
      required: field.required,
      maxLength: field.type === 'textarea' ? 1000 : 500,
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
          {sanitizeText(field.label)}
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
          <p className="text-sm text-red-600">{sanitizeText(error)}</p>
        )}
        
        <div className="text-xs text-purple-600">
          {field.type === 'textarea' 
            ? `${value.length}/1000 characters`
            : `${value.length}/500 characters`
          }
        </div>
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

export default SecureCustomFieldsForm;
