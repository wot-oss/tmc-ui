import { useContext } from 'react';
import { FilterContext } from '../context/index';

export const useFilters = () => {
  const ctx = useContext(FilterContext);

  if (!ctx) {
    throw new Error('useFilters must be used inside FilterProvider');
  }

  return ctx;
};
