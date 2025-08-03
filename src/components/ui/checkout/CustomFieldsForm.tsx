
import React from 'react';
import SecureCustomFieldsForm from './SecureCustomFieldsForm';
import { CustomField } from '@/components/admin/CustomFieldsManager';

interface CustomFieldsFormProps {
  fields: CustomField[];
  values: Record<string, string>;
  onChange: (fieldId: string, value: string) => void;
  errors: Record<string, string>;
}

// Wrapper component that uses the secure version
const CustomFieldsForm: React.FC<CustomFieldsFormProps> = (props) => {
  return <SecureCustomFieldsForm {...props} />;
};

export default CustomFieldsForm;
