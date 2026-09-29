'use client';

import { AppErrorUI } from './_components/error/AppErrorUI';

/**
 * Unhandled render errors land here
 */
export default function Error() {
  return (
    <AppErrorUI
      code={500}
      description="Something went wrong, please try again"
      title="Unknown Error"
    />
  );
}
