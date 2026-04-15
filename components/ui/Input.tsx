import React, { useId } from 'react';

interface InputProps {
  label: string;
  placeholder?: string;
  value: string;
  onChange: (value: string) => void;
  error?: string;
  helperText?: string;
  type?: string;
  disabled?: boolean;
  required?: boolean;
  autoComplete?: string;
  'data-testid'?: string;
  className?: string;
  inputMode?: React.HTMLAttributes<HTMLInputElement>['inputMode'];
  maxLength?: number;
}

export function Input({
  label,
  placeholder,
  value,
  onChange,
  error,
  helperText,
  type = 'text',
  disabled = false,
  required = false,
  autoComplete,
  'data-testid': testId,
  className = '',
  inputMode,
  maxLength,
}: InputProps) {
  const uid = useId();
  const inputId = `input-${uid}`;
  const errorId = `error-${uid}`;
  const helperId = `helper-${uid}`;

  const hasError = Boolean(error);

  return (
    <div className={`flex flex-col gap-1.5 ${className}`}>
      <label
        htmlFor={inputId}
        className="text-sm font-medium text-text-primary select-none"
      >
        {label}
        {required && (
          <span className="text-error ml-1" aria-hidden="true">*</span>
        )}
      </label>

      <input
        id={inputId}
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        disabled={disabled}
        required={required}
        autoComplete={autoComplete}
        inputMode={inputMode}
        maxLength={maxLength}
        data-testid={testId}
        aria-invalid={hasError}
        aria-describedby={
          [hasError ? errorId : '', helperText ? helperId : '']
            .filter(Boolean)
            .join(' ') || undefined
        }
        className={[
          'w-full px-4 py-3 rounded-card',
          'text-sm text-text-primary bg-surface',
          'border transition-all duration-base',
          'placeholder:text-text-muted',
          'focus:outline-none focus:shadow-focus',
          hasError
            ? 'border-error focus:border-error'
            : 'border-border focus:border-primary',
          disabled
            ? 'opacity-50 cursor-not-allowed bg-surface-muted'
            : '',
        ].join(' ')}
      />

      {hasError && (
        <p id={errorId} role="alert" className="text-xs text-error font-medium">
          {error}
        </p>
      )}

      {helperText && !hasError && (
        <p id={helperId} className="text-xs text-text-muted">
          {helperText}
        </p>
      )}
    </div>
  );
}
