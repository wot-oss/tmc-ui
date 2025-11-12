const FourZeroFourNotFound: React.FC<{ error: string }> = ({ error }) => {
  return (
    <>
      <div className="grid min-h-full place-items-center bg-white px-6 py-24 sm:py-32 lg:px-8">
        <div className="text-center">
          <p className="text-base font-semibold text-red-600">Error 404</p>
          <h1 className="mt-4 text-balance text-5xl font-semibold tracking-tight text-gray-900 sm:text-7xl">
            Catalog not found
          </h1>
          <p className="mt-6 text-pretty text-lg font-medium text-gray-500 sm:text-xl/8">
            Oops! We couldn’t locate the catalog you requested. Please double-check the URL endpoint
            on Settings or check if the TMC server is running
          </p>
          <div className="mt-10 flex items-center justify-center gap-x-6">
            <a
              href="/settings"
              className="shadow-xs rounded-md bg-indigo-600 px-3.5 py-2.5 text-sm font-semibold text-white hover:bg-indigo-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
            >
              Go to Settings
            </a>
          </div>
        </div>
      </div>
    </>
  );
};

export default FourZeroFourNotFound;
