
import React from 'react';
import {
  siAmazonaws,
  siNetflix,
  siYoutube,
  siSpotify,
  siMicrosoft,
  siSteam,
  siApple,
} from 'simple-icons';

interface CompanyLogoProps {
  name: string;
  className?: string;
}

const iconMap = {
  'Amazon': siAmazonaws,
  'Netflix': siNetflix,
  'YouTube': siYoutube,
  'Spotify': siSpotify,
  'Xbox': siMicrosoft,
  'Steam': siSteam,
  'Apple': siApple,
};

const CompanyLogo: React.FC<CompanyLogoProps> = ({ name, className = '' }) => {
  const icon = iconMap[name as keyof typeof iconMap];
  
  if (!icon) {
    return (
      <div className={`w-24 h-12 bg-gray-400 rounded flex items-center justify-center ${className}`}>
        <span className="text-white font-medium text-sm">{name}</span>
      </div>
    );
  }

  return (
    <div 
      className={`flex items-center justify-center h-12 ${className}`}
      dangerouslySetInnerHTML={{ 
        __html: icon.svg.replace(
          '<svg',
          `<svg fill="#6B7280" style="height: 48px; width: auto;"`
        )
      }}
    />
  );
};

export default CompanyLogo;
