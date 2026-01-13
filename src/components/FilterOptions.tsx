import React, { useEffect, useMemo, useState } from 'react';

interface FilterOption {
  value: string;
  label: string;
  checked: boolean;
}

interface FilterOptionsProps {
  sectionId: string;
  options: readonly FilterOption[];
  onOptionChange: (sectionId: string, optionValue: string, checked: boolean) => void;
}

const CHUNK_SIZE = 10;
const SCROLL_THRESHOLD_PX = 64;

const FilterOptions: React.FC<FilterOptionsProps> = ({ sectionId, options, onOptionChange }) => {
  const shouldSectionScroll = sectionId === 'manufacturer';
  const shouldScroll = shouldSectionScroll && options.length > CHUNK_SIZE;

  const [visibleCount, setVisibleCount] = useState<number>(CHUNK_SIZE);

  useEffect(() => {
    setVisibleCount(CHUNK_SIZE);
  }, [sectionId, options.length]);

  const visibleOptions = useMemo(() => {
    if (!shouldScroll) return options;
    return options.slice(0, Math.min(visibleCount, options.length));
  }, [options, shouldScroll, visibleCount]);

  const handleScroll: React.UIEventHandler<HTMLDivElement> = (e) => {
    if (!shouldScroll) return;

    const el = e.currentTarget;
    const distanceFromBottom = el.scrollHeight - (el.scrollTop + el.clientHeight);

    if (distanceFromBottom <= SCROLL_THRESHOLD_PX) {
      setVisibleCount((current) => Math.min(current + CHUNK_SIZE, options.length));
    }
  };

  return (
    <div
      onScroll={handleScroll}
      className={shouldScroll ? 'max-h-72 space-y-4 overflow-y-auto pr-2' : 'space-y-4'}
      aria-label={`${sectionId} options`}
    >
      {visibleOptions.map((option, optionIdx) => (
        <div key={option.value} className="flex gap-3">
          <div className="flex h-5 shrink-0 items-center">
            <div className="group grid size-4 grid-cols-1">
              <input
                id={`filter-${sectionId}-${optionIdx}`}
                name={`${sectionId}[]`}
                value={option.value}
                checked={option.checked}
                type="checkbox"
                onChange={(e) => onOptionChange(sectionId, option.value, e.target.checked)}
                className="col-start-1 row-start-1 appearance-none rounded-sm border border-gray-300 bg-white checked:border-indigo-600 checked:bg-indigo-600 indeterminate:border-indigo-600 indeterminate:bg-indigo-600 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 disabled:border-gray-300 disabled:bg-gray-100 disabled:checked:bg-gray-100 forced-colors:appearance-auto"
              />
              <svg
                fill="none"
                viewBox="0 0 14 14"
                className="group-has-disabled:stroke-gray-950/25 pointer-events-none col-start-1 row-start-1 size-3.5 self-center justify-self-center stroke-white"
              >
                <path
                  d="M3 8L6 11L11 3.5"
                  strokeWidth={2}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="opacity-0 group-has-[:checked]:opacity-100"
                />
              </svg>
            </div>
          </div>

          <label
            htmlFor={`filter-${sectionId}-${optionIdx}`}
            className="text-sm text-textValue hover:text-textLabel"
          >
            {option.label}
          </label>
        </div>
      ))}
    </div>
  );
};

export default FilterOptions;
