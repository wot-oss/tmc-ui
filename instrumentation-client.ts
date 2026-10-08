import { THEME_KEY } from './lib/utils/constants';

let theme = 'dark';

try {
  theme = localStorage.getItem(THEME_KEY) === 'light' ? 'light' : 'dark';
} catch {
  /* empty */
}

const root = document.documentElement;

root.classList.remove('light', 'dark');
root.classList.add(theme);
root.dataset.theme = theme;
