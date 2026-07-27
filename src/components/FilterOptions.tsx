import React, { useEffect, useMemo, useState } from 'react';
import Button from './base/Button';
import Input from './base/Input';
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
  const scrollContainerBaseClassName = 'max-h-72 space-y-4 overflow-y-auto pr-[6px]';
  const scrollContainerFirefoxClassName =
    '[scrollbar-color:theme(colors.overlay.scroll-thumb)_transparent] [scrollbar-width:thin]';
  const scrollContainerWebkitClassName =
    '[&::-webkit-scrollbar]:w-[6px] [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-overlay-scroll-thumb [&::-webkit-scrollbar-thumb]:bg-clip-padding [&::-webkit-scrollbar-thumb]:border-y-[8px] [&::-webkit-scrollbar-thumb]:border-y-transparent';
  const scrollContainerClassName = shouldScroll
    ? [
        scrollContainerBaseClassName,
        scrollContainerFirefoxClassName,
        scrollContainerWebkitClassName,
      ].join(' ')
    : 'space-y-4';

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
      className={scrollContainerClassName}
      aria-label={`${sectionId} options`}
    >
      {visibleOptions.map((option, optionIdx) => (
        <div key={option.value} className="flex gap-3">
          <div className="flex h-5 shrink-0 items-center">
            <div className="group relative grid size-4 grid-cols-1">
              <input
                id={`filter-${sectionId}-${optionIdx}`}
                name={`${sectionId}[]`}
                value={option.value}
                checked={option.checked}
                type="checkbox"
                onChange={(e) => onOptionChange(sectionId, option.value, e.target.checked)}
                className="peer col-start-1 row-start-1 size-4 appearance-none rounded-[2px] focus-visible:outline-none disabled:cursor-not-allowed forced-colors:appearance-auto"
              />
              <span className="pointer-events-none absolute left-[-2px] top-[-2px] h-5 w-5 rounded-[4px] border border-focus-ring opacity-0 peer-focus-visible:opacity-100" />
              <svg
                fill="none"
                viewBox="0 0 16 16"
                aria-hidden="true"
                className="pointer-events-none col-start-1 row-start-1 size-4 self-center justify-self-center"
              >
                <rect
                  width="16"
                  height="16"
                  rx="2"
                  className="fill-transparent stroke-text-primary group-hover:fill-surface-input-hover group-hover:stroke-interactive-hover group-has-[:checked]:fill-interactive-pressed group-has-[:disabled]:fill-media group-has-[:checked]:stroke-interactive-pressed group-has-[:disabled]:stroke-text-marker"
                />
                <path
                  fillRule="evenodd"
                  clipRule="evenodd"
                  d="M7.01428 9.85976L11.7739 2.73831L13.4367 3.84965L7.32081 13.0004L2.7594 8.42398L4.17593 7.01209L7.01428 9.85976Z"
                  className="fill-text-inverse-strong opacity-0 group-has-[:disabled]:fill-text-tertiary group-has-[:checked]:opacity-100"
                />
              </svg>
            </div>
          </div>

          <label
            htmlFor={`filter-${sectionId}-${optionIdx}`}
            className="text-sm text-text-primary hover:text-text-secondary"
          >
            {option.label}
          </label>
        </div>
      ))}
      {sectionId === 'protocol' && (
        <div className="ml-7 mt-4">
          <label htmlFor="custom-protocol" className="block text-sm text-text-secondary">
            Add new protocol filter with its URI Scheme
          </label>

          <div className="mt-2 flex gap-2">
            <Input
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
            />
            <Button
              type="button"
              text="Add"
              onClick={handleAddProtocol}
              disabled={!onAddProtocol}
              className="border pl-4 pr-4"
              variant="default"
            ></Button>
          </div>

          {customProtocolError && (
            <p className="mt-2 text-sm text-status-error">{customProtocolError}</p>
          )}
        </div>
      )}
    </div>
  );
};

export default FilterOptions;
