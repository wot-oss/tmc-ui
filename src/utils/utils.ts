import {
  CLIENT_ID_SESSION_KEY,
  CLIENT_SECRET_SESSION_KEY,
  CREDENTIALS_SUBMITTED_SESSION_KEY,
} from './constants';

const getLocalStorage = (key: string): string => {
  const value = localStorage.getItem(key);
  if (value === null) {
    return '';
  }
  return value || '';
};

const setLocalStorage = (value: string, key: string): void => {
  if (value === '') {
    return;
  }

  localStorage.setItem(key, value);
};
const getSessionStorage = (): Storage | null => {
  if (typeof window === 'undefined') {
    return null;
  }

  try {
    return window.sessionStorage;
  } catch {
    return null;
  }
};

const getStoredSessionValue = (key: string): string => {
  return getSessionStorage()?.getItem(key) ?? '';
};

const setStoredSessionValue = (key: string, value: string): void => {
  const storage = getSessionStorage();

  if (!storage) {
    return;
  }

  if (value.trim().length === 0) {
    storage.removeItem(key);
    return;
  }

  storage.setItem(key, value);
};

const hasStoredCredentials = (): boolean => {
  return (
    getStoredSessionValue(CLIENT_ID_SESSION_KEY).trim().length > 0 &&
    getStoredSessionValue(CLIENT_SECRET_SESSION_KEY).trim().length > 0
  );
};

const getStoredCredentialsSubmitted = (): boolean => {
  return (
    getStoredSessionValue(CREDENTIALS_SUBMITTED_SESSION_KEY) === 'true' && hasStoredCredentials()
  );
};

const setStoredCredentialsSubmitted = (submitted: boolean): void => {
  const storage = getSessionStorage();

  if (!storage) {
    return;
  }

  if (!submitted) {
    storage.removeItem(CREDENTIALS_SUBMITTED_SESSION_KEY);
    return;
  }

  storage.setItem(CREDENTIALS_SUBMITTED_SESSION_KEY, 'true');
};

const clearStoredCredentialsSession = (): void => {
  const storage = getSessionStorage();

  if (!storage) {
    return;
  }

  storage.removeItem(CLIENT_ID_SESSION_KEY);
  storage.removeItem(CLIENT_SECRET_SESSION_KEY);
  storage.removeItem(CREDENTIALS_SUBMITTED_SESSION_KEY);
};

export {
  getLocalStorage,
  setLocalStorage,
  getStoredSessionValue,
  setStoredSessionValue,
  getStoredCredentialsSubmitted,
  setStoredCredentialsSubmitted,
  clearStoredCredentialsSession,
};
