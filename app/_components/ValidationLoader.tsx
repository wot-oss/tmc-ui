import Loader from './base/Loader';

export function ValidationLoader() {
  return (
    <main className="bg-surface-canvas min-h-dvh px-4 py-10 sm:px-6 lg:px-8">
      <div className="mx-auto flex min-h-[calc(100dvh-5rem)] max-w-6xl items-center justify-center">
        <Loader text="Validating saved credentials" />
      </div>
    </main>
  );
}
