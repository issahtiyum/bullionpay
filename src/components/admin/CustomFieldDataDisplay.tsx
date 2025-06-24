
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Eye, EyeOff, Copy } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Badge } from '@/components/ui/badge';
import type { Json } from '@/integrations/supabase/types';

interface CustomFieldDataDisplayProps {
  customFieldData: Json | null;
}

const CustomFieldDataDisplay: React.FC<CustomFieldDataDisplayProps> = ({ customFieldData }) => {
  const [showSensitiveData, setShowSensitiveData] = useState<Record<string, boolean>>({});
  const { toast } = useToast();

  // Type guard to check if the data is a valid record
  const isValidRecord = (data: Json): data is Record<string, string> => {
    return data !== null && 
           typeof data === 'object' && 
           !Array.isArray(data) &&
           Object.values(data).every(value => typeof value === 'string');
  };

  if (!customFieldData || !isValidRecord(customFieldData) || Object.keys(customFieldData).length === 0) {
    return <span className="text-sm text-gray-400">No custom data</span>;
  }

  const handleCopyField = (key: string, value: string) => {
    navigator.clipboard.writeText(value);
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

  return (
    <div className="space-y-2">
      {Object.entries(customFieldData).map(([key, value]) => {
        const isSensitive = isSensitiveField(key);
        const shouldHide = isSensitive && !showSensitiveData[key];
        
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
              </div>
              <p className="text-sm font-mono break-all">
                {shouldHide ? '••••••••' : value}
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
