import { useImageLoader } from '@/lib/hooks/useImageLoader';
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
  const { currentSrc, isLoading, handleLoad, handleError } = useImageLoader({
    src: imageSrc,
    fallbackSrc: imageFallbackSrc,
  });

  return (
    <div className="text-text-primary flex h-full w-full flex-col p-5">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0 flex-1">
          <h3 className="text-lg leading-6 font-semibold">{title ?? ''}</h3>
          <p className="text-text-secondary mt-1 truncate text-sm">{manufacturer}</p>
          <span className="bg-overlay-success-tint text-status-success mt-3 inline-flex max-w-full items-center truncate rounded-full px-2.5 py-1 text-xs font-medium">
            {author}
          </span>
        </div>
        <div className="bg-media relative size-24 shrink-0 rounded-lg p-3 shadow-sm">
          {isLoading && (
            <div
              className="bg-surface-panel absolute inset-3 animate-pulse rounded-md"
              aria-label="Loading image"
            />
          )}
          <img
            decoding="async"
            alt={imageAlt}
            src={currentSrc}
            onLoad={handleLoad}
            onError={handleError}
            className={`size-full object-contain transition-opacity ${isLoading ? 'opacity-0' : 'opacity-100'}`}
          />
        </div>
      </div>
      {children}
    </div>
  );
};

export default Card;
