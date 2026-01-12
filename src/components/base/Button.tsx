import React, { useEffect, useState } from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  readonly flashDurationMs?: number;
  text: string;
}

const Button: React.FC<ButtonProps> = ({
  flashDurationMs = 150,
  text,
  disabled,
  className,
  onClick,
  type,
  ...rest
}: ButtonProps) => {
  const [isFlashing, setIsFlashing] = useState(false);

  useEffect(() => {
    if (!isFlashing) return;

    const timeoutId = window.setTimeout(() => {
      setIsFlashing(false);
    }, flashDurationMs);

    return () => window.clearTimeout(timeoutId);
  }, [isFlashing, flashDurationMs]);

  const handleClick: React.MouseEventHandler<HTMLButtonElement> = (event) => {
    if (disabled) return;

    setIsFlashing(true);
    onClick?.(event);
  };

  const resolvedClassName: string = [
    'rounded-md px-3 py-2 text-sm font-medium text-textWhite disabled:cursor-not-allowed disabled:opacity-60',
    isFlashing
      ? 'bg-buttonOnClick hover:bg-buttonOnClick'
      : 'bg-buttonPrimary hover:bg-buttonOnHover',
    className ?? '',
  ]
    .join(' ')
    .trim();

  return (
    <button
      type={type ?? 'button'}
      disabled={disabled}
      className={resolvedClassName}
      onClick={handleClick}
      {...rest}
    >
      {text}
    </button>
  );
};

export default Button;
