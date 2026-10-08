import Button from '../base/Button';

export class AppError extends Error {
  title: string;
  code: number;
  description: string;

  constructor({ code, title, description }: AppErrorProps) {
    super(title ?? 'An unknown error occurred');
    this.code = code ?? 500;
    this.title = title ?? 'An unknown error occurred';
    this.description = description ?? 'Please try again later';
  }
}

export type AppErrorProps = {
  code?: number;
  title?: string;
  description?: string;
  buttonOnclick?: () => void;
  buttonText?: string;
  style?: React.CSSProperties;
};

export function ErrorUI({
  title = 'An unknown error occurred',
  description = 'Please try again later',
  buttonText = 'Reload',
  buttonOnclick,
  style,
}: AppErrorProps) {
  return (
    <div
      className="bg-surface-canvas grid h-full w-full place-items-center px-6 py-24 sm:py-32 lg:px-8"
      style={style}
    >
      <div className="text-center">
        {/* Not fully functional yet */}
        {/* <p className="text-base font-semibold text-status-error">Error {codeError}</p> */}
        <h1 className="text-text-primary mt-4 text-3xl font-semibold tracking-tight text-balance sm:text-7xl">
          {title}
        </h1>
        <p className="text-text-secondary mt-6 text-lg font-medium text-pretty sm:text-xl/8">
          {description}
        </p>
        {buttonOnclick && (
          <div className="mt-10 flex items-center justify-center gap-x-6">
            <Button
              type="button"
              onClick={buttonOnclick}
              text={buttonText}
              className="border pr-4 pl-4"
              variant="default"
            />
          </div>
        )}
      </div>
    </div>
  );
}
