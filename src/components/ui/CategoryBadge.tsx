
import React from 'react';

type CategoryBadgeProps = {
  category: 'Subscription' | 'Gift Card' | 'Game Credit';
};

const categoryColors = {
  'Subscription': 'bg-bullion-blue-100 text-bullion-blue-800',
  'Gift Card': 'bg-bullion-purple-100 text-bullion-purple-800',
  'Game Credit': 'bg-green-100 text-green-800'
};

const CategoryBadge: React.FC<CategoryBadgeProps> = ({ category }) => {
  return (
    <span 
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${categoryColors[category]}`}
    >
      {category}
    </span>
  );
};

export default CategoryBadge;
