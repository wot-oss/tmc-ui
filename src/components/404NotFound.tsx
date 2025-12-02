import { Link } from 'react-router-dom';

const FourZeroFourNotFound: React.FC<{ error: string }> = ({ error }) => {
  const handleReload = () => {
    window.location.reload();
  };

  return (
    <>
      <div className="grid min-h-full place-items-center px-6 py-24 sm:py-32 lg:px-8">
        <div className="text-center">
          <p className="text-error text-base font-semibold">Error 404</p>
          <h1 className="text-textValue mt-4 text-balance text-5xl font-semibold tracking-tight sm:text-7xl">
            {error}
          </h1>
          <p className="text-textLabel mt-6 text-pretty text-lg font-medium sm:text-xl/8">
            Oops! We couldn’t locate the catalog you requested. Please double-check the URL endpoint
            on Settings or check if the TMC server is running
          </p>
          <div className="mt-10 flex items-center justify-center gap-x-6">
            <Link
              to="/settings"
              className="shadow-xs bg-buttonPrimary text-textWhite hover:bg-buttonOnHover focus-visible:outline-buttonFocus rounded-md px-3.5 py-2.5 text-sm font-semibold focus-visible:outline-2 focus-visible:outline-offset-2"
            >
              Go to Settings
            </Link>
            <button
              type="button"
              onClick={handleReload}
              className="shadow-xs bg-buttonPrimary text-textWhite hover:bg-buttonOnHover focus-visible:outline-buttonFocus rounded-md px-3.5 py-2.5 text-sm font-semibold focus-visible:outline-2 focus-visible:outline-offset-2"
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
