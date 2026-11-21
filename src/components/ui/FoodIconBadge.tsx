import React from 'react';
import { ItemCategory } from '../../types';
import { getCategoryVisual, resolveFoodVisual } from '../../data/nigerianFoodRegistry';

type BadgeSize = 'xs' | 'sm' | 'md' | 'lg';

const SIZE_CLASSES: Record<BadgeSize, { box: string; icon: string }> = {
  xs: { box: 'w-7 h-7 rounded-lg', icon: 'text-[15px]' },
  sm: { box: 'w-9 h-9 rounded-xl', icon: 'text-[19px]' },
  md: { box: 'w-10 h-10 rounded-xl', icon: 'text-[21px]' },
  lg: { box: 'w-12 h-12 rounded-2xl', icon: 'text-[26px]' },
};

interface FoodIconBadgeProps {
  name: string;
  category?: ItemCategory;
  size?: BadgeSize;
  className?: string;
}

export const FoodIconBadge: React.FC<FoodIconBadgeProps> = ({
  name,
  category,
  size = 'md',
  className = '',
}) => {
  const visual = resolveFoodVisual(name, category);
  const sz = SIZE_CLASSES[size];

  return (
    <div
      aria-hidden="true"
      className={`${sz.box} ${visual.bgClass} border ${visual.borderClass} flex items-center justify-center shrink-0 select-none ${className}`}
    >
      <span className={`${sz.icon} leading-none`}>{visual.icon}</span>
    </div>
  );
};

interface CategoryIconBadgeProps {
  category: ItemCategory | string;
  size?: BadgeSize;
  className?: string;
}

export const CategoryIconBadge: React.FC<CategoryIconBadgeProps> = ({
  category,
  size = 'md',
  className = '',
}) => {
  const visual = getCategoryVisual(category);
  const sz = SIZE_CLASSES[size];

  return (
    <div
      aria-hidden="true"
      className={`${sz.box} ${visual.bgClass} border ${visual.borderClass} flex items-center justify-center shrink-0 select-none ${className}`}
    >
      <span className={`${sz.icon} leading-none`}>{visual.icon}</span>
    </div>
  );
};
