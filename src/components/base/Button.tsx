import React, { useEffect, useState } from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  readonly flashDurationMs?: number;
  text?: string;
  children?: React.ReactNode;
  variant: 'none' | 'default';
}

const BUTTON_VARIANT_STYLES = {
  none: {
    default: '',
    pressed: '',
  },
  default: {
    default:
      'border-border-interactive bg-transparent text-interactive-primary hover:border-border-interactive-hover hover:bg-surface-input-hover hover:text-interactive-hover',
    pressed:
      'border-border-interactive-pressed bg-transparent text-interactive-pressed hover:border-border-interactive-pressed hover:bg-transparent hover:text-interactive-pressed',
  },
} as const;

const Button: React.FC<ButtonProps> = ({
  flashDurationMs = 150,
  text,
  children,
  variant = 'none',
  disabled = false,
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

  const pressedStateClassName = 'inline-flex items-center gap-1 rounded-[2px] border';

  const resolvedVariantStyle = BUTTON_VARIANT_STYLES[variant];

  const variantClassName = isFlashing
    ? `${pressedStateClassName} ${resolvedVariantStyle.pressed}`
    : resolvedVariantStyle.default;

  const resolvedClassName: string = [
    "relative inline-flex items-center gap-1 rounded-[2px] py-[6px] text-sm font-medium before:pointer-events-none before:absolute before:left-[-3px] before:top-[-3px] before:right-[-3px] before:bottom-[-3px] before:rounded-[4px] before:border before:border-focus-ring before:opacity-0 before:content-[''] focus-visible:outline-none focus-visible:before:opacity-100 disabled:cursor-not-allowed disabled:opacity-60",
    variantClassName,
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
      {children ?? text}
    </button>
  );
};

export default Button;
