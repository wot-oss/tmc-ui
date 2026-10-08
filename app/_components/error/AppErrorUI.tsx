import { ErrorUI } from './ErrorUI';

type AppErrorProps = {
  code?: number;
  title?: string;
  description?: string;
};

export function AppErrorUI({ title, description }: AppErrorProps) {
  return (
    <ErrorUI
      title={title}
      description={description}
      buttonOnclick={() => {
        window.location.reload();
      }}
      style={{
        minHeight: '100dvh',
      }}
    />
  );
}
