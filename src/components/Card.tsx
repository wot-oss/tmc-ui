import React from 'react';

interface CardProps {
  title: string | undefined;
  author: string;
  manufacturer: string;
  imageSrc: string;
  imageAlt: string;
  imageFallbackSrc: string;
  children?: React.ReactNode;
}

const Card: React.FC<CardProps> = ({
  title,
  author,
  manufacturer,
  imageSrc,
  imageAlt,
  imageFallbackSrc,
  children,
}) => {
  return (
    <div className="flex w-full flex-col items-start space-y-4 p-6 sm:flex-row sm:items-center sm:justify-between sm:space-x-6 sm:space-y-0">
      <div className="flex-1 truncate text-text-primary">
        <div className="flex items-center space-x-3">
          <h3 className="text-sm font-medium">{title ?? ''}</h3>
        </div>
        <span className="inline-flex shrink-0 items-center rounded-full bg-overlay-success-tint p-2 text-xs font-medium text-status-success">
          {author}
        </span>
        <p className="mt-1 truncate text-sm text-text-secondary">{manufacturer}</p>
        {children}
      </div>
      <div className="flex-1">
        <div className="inline-flex rounded-lg bg-media p-4 shadow-md">
          <img
            loading="lazy"
            decoding="async"
            alt={imageAlt}
            src={imageSrc}
            onError={(e) => {
              e.currentTarget.src = imageFallbackSrc;
            }}
            className="aspect-square size-28 shrink-0 rounded-lg object-contain"
          />
        </div>
      </div>
    </div>
  );
};

export default Card;
