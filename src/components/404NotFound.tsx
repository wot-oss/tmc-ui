import React from 'react';
import Button from './base/Button';

const FourZeroFourNotFound: React.FC<{ error: string }> = ({ error }) => {
  const handleReload = () => {
    window.location.reload();
  };

  return (
    <>
      <div className="grid min-h-dvh place-items-center bg-surface-canvas px-6 py-24 sm:py-32 lg:px-8">
        <div className="text-center">
          <p className="text-base font-semibold text-status-error">Error 404</p>
          <h1 className="mt-4 text-balance text-5xl font-semibold tracking-tight text-text-primary sm:text-7xl">
            {error}
          </h1>
          <p className="mt-6 text-pretty text-lg font-medium text-text-secondary sm:text-xl/8">
            Oops! We couldn’t locate the catalog you requested.
          </p>
          <div className="mt-10 flex items-center justify-center gap-x-6">
            <Button
              type="button"
              onClick={handleReload}
              text="Reload"
              className="border pl-4 pr-4"
              variant="default"
            />
          </div>
        </div>
      </div>
    </>
  );
};

export default FourZeroFourNotFound;
