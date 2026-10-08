'use client';
import React, { useEffect, useMemo, useRef, useState } from 'react';

interface IDropdownProps {
  id: string;
  label: string;
  options: { key: string; value: string }[];
  value?: string;
  onChange?: (value: string) => void;
  className?: string;
  wrapperClassName?: string;
  chevronClassName?: string;
  showChevron?: boolean;
}

const Dropdown: React.FC<IDropdownProps> = (props) => {
  const [isOpen, setIsOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement | null>(null);

  const selectedOption = useMemo(
    () => props.options.find((option) => option.key === props.value) ?? props.options[0] ?? null,
    [props.options, props.value],
  );

  useEffect(() => {
    if (!isOpen) return;

    const handlePointerDown = (event: MouseEvent | TouchEvent) => {
      if (!wrapperRef.current?.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handlePointerDown);
    document.addEventListener('touchstart', handlePointerDown);
    document.addEventListener('keydown', handleEscape);

    return () => {
      document.removeEventListener('mousedown', handlePointerDown);
      document.removeEventListener('touchstart', handlePointerDown);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen]);

  const wrapperClassName = [props.wrapperClassName, 'relative'].filter(Boolean).join(' ');

  const triggerClassName = [
    "relative before:pointer-events-none before:absolute before:left-[-3px] before:top-[-3px] before:right-[-3px] before:bottom-[-3px] before:rounded-[4px] before:border before:border-focus-ring before:opacity-0 before:content-[''] focus-visible:outline-none focus-visible:before:opacity-100 hover:rounded-[2px]  hover:bg-surface-input-hover",
    'text-icon-brand text-sm font-normal not-italic',
    props.className,
    props.showChevron ? 'pr-12' : '',
  ]
    .filter(Boolean)
    .join(' ');

  const handleSelectOption = (value: string) => {
    props.onChange?.(value);
    setIsOpen(false);
  };

  return (
    <div ref={wrapperRef} className={wrapperClassName}>
      <button
        type="button"
        id={props.id}
        aria-label={props.label}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        className={triggerClassName}
        onClick={() => setIsOpen((current) => !current)}
      >
        <span className="block truncate text-left">{selectedOption?.value ?? ''}</span>
      </button>
      {props.showChevron ? (
        <span className="pointer-events-none absolute inset-y-0 right-4 flex items-center">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            aria-hidden="true"
            className={[
              props.chevronClassName ?? 'text-icon-brand h-5 w-5',
              'transition-transform duration-200',
              isOpen ? 'rotate-180' : '',
            ]
              .filter(Boolean)
              .join(' ')}
          >
            <path
              d="M6 10L7.4 8.60001L12 13.1L16.6 8.60001L18 10L12 16L6 10Z"
              fill="currentColor"
            />
          </svg>
        </span>
      ) : null}
      {isOpen ? (
        <div className="bg-surface-canvas absolute top-full right-0 left-0 z-20 mt-2 overflow-hidden rounded-md shadow-lg">
          <ul role="listbox" aria-labelledby={props.id} className="max-h-60 overflow-y-auto py-1">
            {props.options.map((option, index) => (
              <li
                key={`${option.key} + ${index}`}
                role="option"
                aria-selected={option.key === selectedOption?.key}
              >
                <button
                  type="button"
                  className="text-text-primary hover:bg-surface-input-hover hover:text-interactive-hover block w-full px-3 py-2 text-left text-sm font-normal tracking-normal transition"
                  onClick={() => handleSelectOption(option.key)}
                >
                  {option.value}
                </button>
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </div>
  );
};

export default Dropdown;
