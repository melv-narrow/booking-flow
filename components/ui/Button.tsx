import React from 'react';

type ButtonVariant = 'primary' | 'secondary' | 'ghost';
type ButtonType = 'button' | 'submit' | 'reset';

interface ButtonProps {
  variant?: ButtonVariant;
  isLoading?: boolean;
  disabled?: boolean;
  onClick?: () => void;
  type?: ButtonType;
  children: React.ReactNode;
  className?: string;
  'aria-label'?: string;
}

const variantStyles: Record<ButtonVariant, string> = {
  primary: [
    'bg-primary text-white',
    'hover:bg-primary-hover',
    'active:bg-primary-hover active:scale-[0.98]',
    'disabled:bg-text-muted disabled:cursor-not-allowed',
  ].join(' '),

  secondary: [
    'bg-surface text-primary border border-primary',
    'hover:bg-primary-light',
    'active:bg-primary-light active:scale-[0.98]',
    'disabled:border-text-muted disabled:text-text-muted disabled:cursor-not-allowed',
  ].join(' '),

  ghost: [
    'bg-transparent text-text-secondary',
    'hover:bg-surface-muted hover:text-text-primary',
    'active:bg-surface-muted active:scale-[0.98]',
    'disabled:text-text-muted disabled:cursor-not-allowed',
  ].join(' '),
};

export function Button({
  variant = 'primary',
  isLoading = false,
  disabled = false,
  onClick,
  type = 'button',
  children,
  className = '',
  'aria-label': ariaLabel,
}: ButtonProps) {
  const isDisabled = disabled || isLoading;

  return (
    <button
      type={type}
      disabled={isDisabled}
      onClick={onClick}
      aria-label={ariaLabel}
      aria-busy={isLoading}
      className={[
        // Base
        'relative inline-flex items-center justify-center gap-2',
        'px-5 py-3 rounded-btn',
        'text-sm font-semibold leading-none',
        'transition-all duration-base',
        'focus-visible:outline-none focus-visible:ring-0',
        'focus-visible:shadow-focus',
        // Variant
        variantStyles[variant],
        // Loading cursor
        isLoading ? 'cursor-wait' : '',
        className,
      ].join(' ')}
    >
      {isLoading && (
        <span
          className="spinner-ring w-4 h-4 shrink-0"
          aria-hidden="true"
          role="presentation"
        />
      )}
      <span className={isLoading ? 'opacity-80' : ''}>{children}</span>
    </button>
  );
}
