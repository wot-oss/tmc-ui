'use client';
import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  className?: string;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(({ className, ...props }, ref) => {
  const resolvedClassName = [
    'w-full rounded-md border border-transparent bg-surface-input px-3 py-2 text-sm text-text-primary placeholder:text-text-tertiary outline-none focus:outline-none focus-visible:outline-none hover:rounded-[2px] hover:border-border-interactive-hover hover:bg-surface-input-hover focus:rounded-[2px] focus:border-border-interactive-hover focus:bg-surface-input-hover font-mono',
    className ?? '',
  ]
    .join(' ')
    .trim();

  return (
    <div className="before:border-focus-ring relative w-full before:pointer-events-none before:absolute before:-top-0.75 before:-right-0.75 before:-bottom-0.75 before:-left-0.75 before:rounded-sm before:border before:opacity-0 before:content-[''] focus-within:before:opacity-100">
      <input ref={ref} className={resolvedClassName} {...props} />
    </div>
  );
});

Input.displayName = 'Input';

export default Input;
