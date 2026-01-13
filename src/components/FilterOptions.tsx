import React, { useEffect, useMemo, useState } from 'react';
import Button from './base/Button';
import { normalizeString } from '../utils/strings';
import { OPTIONS_LIST_SIZE, SCROLL_THRESHOLD_PX } from '../utils/constants';

interface FilterOptionsProps {
  sectionId: string;
  options: readonly FilterData[];
  onOptionChange: (sectionId: string, optionValue: string, checked: boolean) => void;
  onAddProtocol?: (protocol: FilterData) => void;
}

const FilterOptions: React.FC<FilterOptionsProps> = ({
  sectionId,
  options,
  onOptionChange,
  onAddProtocol,
}) => {
  const shouldScroll = options.length > OPTIONS_LIST_SIZE;

  const [visibleCount, setVisibleCount] = useState<number>(OPTIONS_LIST_SIZE);

  const [customProtocolError, setCustomProtocolError] = useState<string | null>(null);
  const [customProtocol, setCustomProtocol] = useState('');

  useEffect(() => {
    setVisibleCount(OPTIONS_LIST_SIZE);
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
      setVisibleCount((current) => Math.min(current + OPTIONS_LIST_SIZE, options.length));
    }
  };

  const validateProtocolLabel = (label: string) => {
    const trimmed = label.trim();
    if (!trimmed) return 'Protocol cannot be empty.';
    if (trimmed.length < 2) return 'Protocol must be at least 2 characters.';
    if (!/^[A-Za-z0-9 ._/+-]+$/.test(trimmed)) {
      return 'Protocol contains invalid characters.';
    }

    const normalized = normalizeString(trimmed);
    const alreadyExists = options.some(
      (p) =>
        p.value.toLowerCase() === normalized || p.label.toLowerCase() === trimmed.toLowerCase(),
    );
    if (alreadyExists) return 'That protocol already exists.';

    return null;
  };

  const handleAddProtocol = () => {
    const error = validateProtocolLabel(customProtocol);
    setCustomProtocolError(error);
    if (error) return;

    const label = customProtocol.trim();
    const value = normalizeString(label);

    const protocol = { value, label, checked: true as const };
    onAddProtocol?.(protocol);
    onOptionChange('protocol', value, true);

    setCustomProtocol('');
    setCustomProtocolError(null);
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
      {sectionId === 'protocol' && (
        <div className="ml-7 mt-4">
          <label htmlFor="custom-protocol" className="block text-sm text-textLabel">
            Add new protocol filter with its URI Scheme
          </label>

          <div className="mt-2 flex gap-2">
            <input
              id="custom-protocol"
              type="text"
              value={customProtocol}
              onChange={(e) => {
                setCustomProtocol(e.target.value);
                if (customProtocolError) setCustomProtocolError(null);
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleAddProtocol();
                }
              }}
              placeholder="e.g. opc.tcp"
              className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-textValue focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
            />
            <Button
              type="button"
              text="Add"
              onClick={handleAddProtocol}
              disabled={!onAddProtocol}
              className=""
            ></Button>
          </div>

          {customProtocolError && (
            <p className="mt-2 text-sm text-red-600">{customProtocolError}</p>
          )}
        </div>
      )}
    </div>
  );
};

export default FilterOptions;
