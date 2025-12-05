import { Link } from 'react-router-dom';

const FourZeroFourNotFound: React.FC<{ error: string }> = ({ error }) => {
  const handleReload = () => {
    window.location.reload();
  };

  return (
    <>
      <div className="grid min-h-dvh place-items-center bg-bgBodyPrimary px-6 py-24 sm:py-32 lg:px-8">
        <div className="text-center">
          <p className="text-base font-semibold text-error">Error 404</p>
          <h1 className="mt-4 text-balance text-5xl font-semibold tracking-tight text-textValue sm:text-7xl">
            {error}
          </h1>
          <p className="mt-6 text-pretty text-lg font-medium text-textLabel sm:text-xl/8">
            Oops! We couldn’t locate the catalog you requested. Please double-check the URL endpoint
            on Settings or check if the TMC server is running
          </p>
          <div className="mt-10 flex items-center justify-center gap-x-6">
            <button
              type="button"
              onClick={handleReload}
              className="shadow-xs rounded-md bg-buttonPrimary px-3.5 py-2.5 text-sm font-semibold text-textWhite hover:bg-buttonOnHover focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-buttonFocus"
            >
              Reload
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default FourZeroFourNotFound;
