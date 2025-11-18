import { CheckCircleIcon, XMarkIcon } from '@heroicons/react/20/solid';

const Success: React.FC = () => {
  return (
    <div className="rounded-md bg-green-500/10 p-4 outline outline-green-500/20">
      <div className="flex">
        <div className="shrink-0">
          <CheckCircleIcon aria-hidden="true" className="size-5 text-green-400" />
        </div>
        <div className="ml-3">
          <p className="text-sm font-medium text-green-300">Successfully uploaded</p>
        </div>
        <div className="ml-auto pl-3">
          <div className="-mx-1.5 -my-1.5">
            <button
              type="button"
              className="focus-visible:outline-hidden inline-flex rounded-md p-1.5 text-green-400 hover:bg-green-500/10 focus-visible:ring-2 focus-visible:ring-green-500 focus-visible:ring-offset-1 focus-visible:ring-offset-green-900"
            >
              <span className="sr-only">Dismiss</span>
              <XMarkIcon aria-hidden="true" className="size-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Success;
