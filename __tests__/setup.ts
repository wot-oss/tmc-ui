import { afterEach, beforeEach, vi } from 'vitest';
import { cleanup } from '@testing-library/react';

beforeEach(() => {
  if (typeof window !== 'undefined') {
    window.sessionStorage.clear();
    window.location.hash = '#/';
  }
});

afterEach(() => {
  cleanup();
  vi.clearAllMocks();
  vi.unstubAllEnvs();
  vi.unstubAllGlobals();
  if (typeof window !== 'undefined') {
    window.sessionStorage.clear();
    window.location.hash = '#/';
  }
});
