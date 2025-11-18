import { XCircleIcon } from '@heroicons/react/20/solid';

const Error: React.FC<{ mainMessage: string }> = ({ mainMessage }) => {
  return (
    <div className="rounded-md bg-red-500/15 p-4 outline outline-red-500/25">
      <div className="flex">
        <div className="shrink-0">
          <XCircleIcon aria-hidden="true" className="size-5 text-red-400" />
        </div>
        <div className="ml-3">
          <h3 className="text-sm font-medium text-red-200">{mainMessage}</h3>
        </div>
      </div>
    </div>
  );
};

export default Error;
