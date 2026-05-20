import React from 'react';
import Button from './base/Button';

type FourZeroFourNotFoundProps = {
  titleError?: string;
  descriptionError?: string;
};

const DEFAULT_SECONDARY_ERROR = 'Oops! We couldn’t locate the catalog you requested.';

const FourZeroFourNotFound: React.FC<FourZeroFourNotFoundProps> = ({
  titleError,
  descriptionError,
}) => {
  const resolvedTitleError = titleError ?? 'Page not found';
  const resolvedDescriptionError = descriptionError ?? DEFAULT_SECONDARY_ERROR;

  const handleReload = () => {
    window.location.reload();
  };

  return (
    <>
      <div className="bg-surface-canvas grid min-h-dvh place-items-center px-6 py-24 sm:py-32 lg:px-8">
        <div className="text-center">
          <p className="text-status-error text-base font-semibold">Error 404</p>
          <h1 className="text-text-primary mt-4 text-balance text-3xl font-semibold tracking-tight sm:text-7xl">
            {resolvedTitleError}
          </h1>
          <p className="text-text-secondary mt-6 text-pretty text-lg font-medium sm:text-xl/8">
            {resolvedDescriptionError}
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
