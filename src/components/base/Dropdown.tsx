import React from 'react';
import { ChevronDownIcon } from '@heroicons/react/24/solid';
import { Select } from '@headlessui/react';

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
  const wrapperClassName = [props.wrapperClassName, props.showChevron ? 'relative' : '']
    .filter(Boolean)
    .join(' ');

  const selectClassName = [props.className, props.showChevron ? 'appearance-none pr-12' : '']
    .filter(Boolean)
    .join(' ');

  return (
    <div className={wrapperClassName}>
      <Select
        id={props.id}
        name={props.label}
        aria-label={props.label}
        value={props.value}
        onChange={(e) => props.onChange?.(e.target.value)}
        className={selectClassName}
      >
        {props.options.map((option, i) => {
          return (
            <option
              key={`${option.key} + ${i}`}
              className="text-sm font-normal tracking-normal text-textValue"
              value={option.key}
            >
              {option.value}
            </option>
          );
        })}
      </Select>
      {props.showChevron ? (
        <span className="pointer-events-none absolute inset-y-0 right-4 flex items-center">
          <ChevronDownIcon
            aria-hidden="true"
            className={props.chevronClassName ?? 'h-5 w-5 text-textValue'}
          />
        </span>
      ) : null}
    </div>
  );
};

export default Dropdown;
