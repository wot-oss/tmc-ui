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

export { getLocalStorage, setLocalStorage };
