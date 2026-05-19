import { THEME_KEY } from './constants';

const THEMES = ['light', 'dark'] as const;
const DEFAULT_THEME = 'dark';

export type ThemeName = (typeof THEMES)[number];

const isThemeName = (value: string | null): value is ThemeName =>
  value === 'light' || value === 'dark';

const getStorage = (): Storage | null => {
  if (typeof window === 'undefined') {
    return null;
  }

  try {
    return window.localStorage;
  } catch {
    return null;
  }
};

const getRootElement = (): HTMLElement | null => {
  if (typeof document === 'undefined') {
    return null;
  }

  return document.documentElement;
};

export const getStoredTheme = (): ThemeName => {
  const storedTheme = getStorage()?.getItem(THEME_KEY) ?? null;

  return isThemeName(storedTheme) ? storedTheme : DEFAULT_THEME;
};

export const applyTheme = (theme: ThemeName): ThemeName => {
  const rootElement = getRootElement();

  if (!rootElement) {
    return theme;
  }

  rootElement.classList.remove(...THEMES);
  rootElement.classList.add(theme);
  rootElement.dataset.theme = theme;

  return theme;
};

export const initializeTheme = (): ThemeName => applyTheme(getStoredTheme());

export const setPreferredTheme = (theme: ThemeName): ThemeName => {
  try {
    getStorage()?.setItem(THEME_KEY, theme);
  } catch {
    // Ignore storage write failures and still apply the theme in-memory.
  }

  return applyTheme(theme);
};

export const togglePreferredTheme = (currentTheme: ThemeName): ThemeName =>
  setPreferredTheme(currentTheme === 'dark' ? 'light' : 'dark');