
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Eye, EyeOff, Copy } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Badge } from '@/components/ui/badge';
import type { Json } from '@/integrations/supabase/types';

interface CustomFieldDataDisplayProps {
  customFieldData: Json | null;
}

// Define acceptable value types for custom field data
type CustomFieldValue = string | number | boolean;
type CustomFieldRecord = Record<string, CustomFieldValue>;

const CustomFieldDataDisplay: React.FC<CustomFieldDataDisplayProps> = ({ customFieldData }) => {
  const [showSensitiveData, setShowSensitiveData] = useState<Record<string, boolean>>({});
  const { toast } = useToast();

  // Add debugging information
  console.log('CustomFieldDataDisplay received data:', customFieldData);

  // Updated type guard to check if the data is a valid record with mixed value types
  const isValidRecord = (data: Json): data is CustomFieldRecord => {
    return data !== null && 
           typeof data === 'object' && 
           !Array.isArray(data) &&
           Object.values(data).every(value => 
             typeof value === 'string' || 
             typeof value === 'number' || 
             typeof value === 'boolean'
           );
  };

  if (!customFieldData) {
    console.log('No custom field data provided');
    return <span className="text-sm text-gray-400">No custom data</span>;
  }

  if (!isValidRecord(customFieldData)) {
    console.log('Invalid custom field data format:', customFieldData);
    console.log('Data type:', typeof customFieldData);
    console.log('Is array:', Array.isArray(customFieldData));
    if (typeof customFieldData === 'object' && customFieldData !== null) {
      console.log('Object values and types:', Object.entries(customFieldData).map(([key, value]) => ({
        key,
        value,
        type: typeof value
      })));
    }
    return <span className="text-sm text-red-400">Invalid data format</span>;
  }

  const dataEntries = Object.entries(customFieldData);
  if (dataEntries.length === 0) {
    console.log('Custom field data is empty object');
    return <span className="text-sm text-gray-400">No custom data</span>;
  }

  console.log('Displaying custom field data entries:', dataEntries);

  const handleCopyField = (key: string, value: CustomFieldValue) => {
    const stringValue = String(value);
    navigator.clipboard.writeText(stringValue);
    toast({
      description: `${key} copied to clipboard`,
    });
  };

  const toggleSensitiveData = (key: string) => {
    setShowSensitiveData(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const isSensitiveField = (key: string) => {
    const sensitiveKeywords = ['password', 'pass', 'secret', 'key', 'token'];
    return sensitiveKeywords.some(keyword => key.toLowerCase().includes(keyword));
  };

  const formatFieldName = (key: string) => {
    return key
      .split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  const formatValue = (value: CustomFieldValue): string => {
    if (typeof value === 'boolean') {
      return value ? 'Yes' : 'No';
    }
    return String(value);
  };

  return (
    <div className="space-y-2">
      {dataEntries.map(([key, value]) => {
        const isSensitive = isSensitiveField(key);
        const shouldHide = isSensitive && !showSensitiveData[key];
        const displayValue = formatValue(value);
        
        return (
          <div key={key} className="flex items-center gap-2 p-2 bg-gray-50 rounded-md">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <Badge variant="outline" className="text-xs">
                  {formatFieldName(key)}
                </Badge>
                {isSensitive && (
                  <Badge variant="secondary" className="text-xs">
                    Sensitive
                  </Badge>
                )}
                {typeof value === 'number' && (
                  <Badge variant="outline" className="text-xs bg-blue-50 text-blue-700">
                    Number
                  </Badge>
                )}
                {typeof value === 'boolean' && (
                  <Badge variant="outline" className="text-xs bg-green-50 text-green-700">
                    Yes/No
                  </Badge>
                )}
              </div>
              <p className="text-sm font-mono break-all">
                {shouldHide ? '••••••••' : displayValue}
              </p>
            </div>
            
            <div className="flex items-center gap-1">
              {isSensitive && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => toggleSensitiveData(key)}
                  className="h-6 w-6 p-0"
                  title={shouldHide ? "Show value" : "Hide value"}
                >
                  {shouldHide ? <Eye className="h-3 w-3" /> : <EyeOff className="h-3 w-3" />}
                </Button>
              )}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleCopyField(key, value)}
                className="h-6 w-6 p-0"
                title="Copy value"
              >
                <Copy className="h-3 w-3" />
              </Button>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default CustomFieldDataDisplay;
