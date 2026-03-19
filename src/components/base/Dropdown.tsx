import React from 'react';
import { Select } from '@headlessui/react';
interface IDropdownProps {
  id: string;
  label: string;
  options: { key: string; value: string }[];
  value?: string;
  onChange?: (value: string) => void;
  className?: string;
}

const Dropdown: React.FC<IDropdownProps> = (props) => {
  return (
    <Select
      id={props.id}
      name={props.label}
      aria-label={props.label}
      value={props.value}
      onChange={(e) => props.onChange?.(e.target.value)}
      className={props.className}
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
  );
};

export default Dropdown;
