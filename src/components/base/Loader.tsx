import React from 'react';

interface LoaderProps {
  readonly text?: string;
  readonly className?: string;
  readonly compact?: boolean;
}

const LOADER_DOTS = Array.from({ length: 6 }, (_, index) => index);

const Loader: React.FC<LoaderProps> = ({ text, className = '' }: LoaderProps) => {
  const containerClassName = ['flex items-center justify-center flex-col gap-3 py-3', className]
    .join(' ')
    .trim();

  return (
    <div className={containerClassName} role="status" aria-live="polite">
      <div className="flex items-center justify-center px-4 text-textValue">
        {LOADER_DOTS.map((dotIndex) => (
          <span
            key={dotIndex}
            className="inline-block animate-loader-slide-fade text-xl opacity-0"
            style={{ animationDelay: `${(LOADER_DOTS.length - 1 - dotIndex) * 100}ms` }}
            aria-hidden="true"
          >
            ●
          </span>
        ))}
      </div>
      {text ? <span className="text-sm text-textLabel">{text}</span> : null}
      <span className="sr-only">{text ?? 'Loading'}</span>
    </div>
  );
};

export default Loader;
