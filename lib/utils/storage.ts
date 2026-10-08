import {
  CLIENT_ID_SESSION_KEY,
  CLIENT_SECRET_SESSION_KEY,
  CREDENTIALS_SUBMITTED_SESSION_KEY,
} from './constants';
import { isNonEmptyString } from './strings';

/**
 * Gets a value from the local storage
 * @returns a non-empty string or null
 * @throws if called not on client
 */
const getLocalStorage = (key: string): string | null => {
  if (typeof window === 'undefined') {
    throw new Error("Can't access local storage on the server");
  }
  const value = localStorage.getItem(key);
  return isNonEmptyString(value) ? value : null;
};

/**
 * Sets a value in the local storage
 * @throws if called not on client
 */
const setLocalStorage = (value: string, key: string): void => {
  if (typeof window === 'undefined') {
    throw new Error("Can't access local storage on the server");
  }
  if (!isNonEmptyString(value)) {
    localStorage.removeItem(key);
    return;
  }

  localStorage.setItem(key, value);
};

/**
 * Gets the session storage from the client
 * @returns Storage
 * @throws if not on client
 */
const getSessionStorage = (): Storage => {
  if (typeof window === 'undefined') {
    throw new Error("Can't access session storage on the server");
  }
  return window.sessionStorage;
};

/**
 * Gets a value from the session storage
 * @returns a non-empty string or null
 * @throws if getSessionStorage() throws an error
 */
const getProcessedSessionStoreValue = (key: string): string | null => {
  const value = getSessionStorage().getItem(key);
  return isNonEmptyString(value) ? value : null;
};

/**
 * Sets a value to the storage
 * @throws if getSessionStorage() throws an error
 */
const setStoredSessionValue = (key: string, value: string): void => {
  const storage = getSessionStorage();

  if (!isNonEmptyString(value)) {
    storage.removeItem(key);
    return;
  }

  storage.setItem(key, value);
};

/**
 * Checks if clientId and clientSecret exist in the store
 * @throws if getSessionStorage() throws an error
 *
 */
const hasStoredCredentials = (): boolean => {
  const clientId = getProcessedSessionStoreValue(CLIENT_ID_SESSION_KEY);
  const clientSecret = getProcessedSessionStoreValue(CLIENT_SECRET_SESSION_KEY);
  return isNonEmptyString(clientId) && isNonEmptyString(clientSecret);
};

/**
 * Checks if credentials are submitted
 * @throws if getSessionStorage() throws an error
 */
const getStoredCredentialsSubmitted = (): boolean => {
  return (
    getProcessedSessionStoreValue(CREDENTIALS_SUBMITTED_SESSION_KEY) === 'true' &&
    hasStoredCredentials()
  );
};

/**
 * @throws if getSessionStorage() throws an error
 */
const setStoredCredentialsSubmitted = (submitted: boolean): void => {
  const storage = getSessionStorage();

  if (!submitted) {
    storage.removeItem(CREDENTIALS_SUBMITTED_SESSION_KEY);
    return;
  }

  storage.setItem(CREDENTIALS_SUBMITTED_SESSION_KEY, 'true');
};

/**
 * @throws if getSessionStorage() throws an error
 */
const clearStoredCredentialsSession = (): void => {
  const storage = getSessionStorage();

  storage.removeItem(CLIENT_ID_SESSION_KEY);
  storage.removeItem(CLIENT_SECRET_SESSION_KEY);
  storage.removeItem(CREDENTIALS_SUBMITTED_SESSION_KEY);
};

// TODO: remove unused functions
export {
  getLocalStorage,
  setLocalStorage,
  getProcessedSessionStoreValue,
  setStoredSessionValue,
  getStoredCredentialsSubmitted,
  setStoredCredentialsSubmitted,
  clearStoredCredentialsSession,
};
