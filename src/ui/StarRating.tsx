import React from 'react';
import { StarIcon } from './LumaIcons';

interface StarRatingProps {
  stars: 0 | 1 | 2 | 3;
  size?: 'sm' | 'md' | 'lg';
  revealedUpTo?: number;
  className?: string;
}

const SIZE_CLASSES: Record<'sm' | 'md' | 'lg', string> = {
  sm: 'w-4 h-4',
  md: 'w-5 h-5',
  lg: 'w-8 h-8',
};

export const StarRating: React.FC<StarRatingProps> = ({
  stars,
  size = 'md',
  revealedUpTo = 3,
  className = '',
}) => {
  const iconCls = SIZE_CLASSES[size];

  return (
    <div
      className={`inline-flex items-center gap-1 ${className}`}
      role="img"
      aria-label={`${stars} of 3 stars`}
    >
      {([1, 2, 3] as const).map((idx) => {
        const isFilled = idx <= stars && idx <= revealedUpTo;
        return (
          <span
            key={idx}
            className={`inline-flex transition-transform duration-300 ${
              isFilled ? 'scale-100' : 'scale-95 opacity-70'
            }`}
          >
            <StarIcon filled={isFilled} className={iconCls} />
          </span>
        );
      })}
    </div>
  );
};
