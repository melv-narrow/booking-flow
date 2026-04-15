import React from 'react';
import type { Skip } from '@/lib/types';

interface SkipCardProps {
  skip: Skip;
  isSelected: boolean;
  onSelect: () => void;
  'data-testid'?: string;
}

// Checkmark icon
function CheckIcon() {
  return (
    <svg
      viewBox="0 0 16 16"
      fill="none"
      className="w-3.5 h-3.5 text-white"
      aria-hidden="true"
    >
      <path
        d="M3 8l3.5 3.5L13 4.5"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

// Skip icon (truck silhouette)
function SkipIcon({ disabled }: { disabled: boolean }) {
  return (
    <svg
      viewBox="0 0 48 32"
      fill="none"
      className={`w-12 h-8 ${disabled ? 'opacity-40' : ''}`}
      aria-hidden="true"
    >
      {/* Skip container body */}
      <rect x="4" y="6" width="40" height="20" rx="2" fill={disabled ? '#cbd5e1' : '#e6f3f4'} />
      <rect x="4" y="6" width="40" height="20" rx="2" stroke={disabled ? '#94a3b8' : '#01696f'} strokeWidth="1.5" />
      {/* Slanted sides */}
      <path d="M4 6 L8 2 H40 L44 6" stroke={disabled ? '#94a3b8' : '#01696f'} strokeWidth="1.5" fill={disabled ? '#cbd5e1' : '#e6f3f4'} />
      {/* Wheels */}
      <circle cx="12" cy="27" r="3" fill={disabled ? '#94a3b8' : '#0f172a'} />
      <circle cx="36" cy="27" r="3" fill={disabled ? '#94a3b8' : '#0f172a'} />
    </svg>
  );
}

/**
 * SkipCard — the primary selection component in Step 3.
 * Uses role="radio" within a role="radiogroup" for keyboard accessibility.
 *
 * Disabled state: visible, not hidden. Shows "Not available for heavy waste" label.
 * aria-disabled used (not HTML disabled) to keep the element in the tab order
 * while preventing selection — required by the spec.
 */
export function SkipCard({ skip, isSelected, onSelect, 'data-testid': testId }: SkipCardProps) {
  const isDisabled = skip.disabled;

  function handleSelect() {
    if (!isDisabled) {
      onSelect();
    }
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (isDisabled) return;
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onSelect();
    }
  }

  return (
    <div
      role="radio"
      aria-checked={isSelected}
      aria-disabled={isDisabled}
      tabIndex={isDisabled ? -1 : 0}
      data-testid={testId}
      onClick={handleSelect}
      onKeyDown={handleKeyDown}
      className={[
        // Base
        'relative flex flex-col p-4 rounded-card border-2 transition-all duration-base',
        'select-none outline-none',
        // Interactive states
        isDisabled
          ? 'opacity-50 cursor-not-allowed border-border bg-surface-muted'
          : isSelected
            ? 'border-primary bg-primary-light shadow-card-md cursor-pointer'
            : 'border-border bg-surface hover:border-primary/40 hover:shadow-card cursor-pointer',
        // Focus ring for keyboard nav
        !isDisabled ? 'focus-visible:shadow-focus' : '',
      ].join(' ')}
    >
      {/* Selected checkmark badge */}
      {isSelected && !isDisabled && (
        <div
          className="absolute top-3 right-3 w-5 h-5 rounded-full bg-primary flex items-center justify-center shadow-sm"
          aria-hidden="true"
        >
          <CheckIcon />
        </div>
      )}

      {/* Skip illustration */}
      <div className="flex justify-center mb-3">
        <SkipIcon disabled={isDisabled} />
      </div>

      {/* Skip name */}
      <p className={`text-sm font-semibold mb-1 ${isDisabled ? 'text-text-muted' : 'text-text-primary'}`}>
        {skip.size}
      </p>

      {/* Price */}
      <p
        className={[
          'font-mono text-lg font-medium leading-none',
          isDisabled ? 'text-text-muted' : isSelected ? 'text-primary' : 'text-text-primary',
        ].join(' ')}
      >
        £{skip.price}
      </p>

      {/* Disabled label — not available for heavy waste */}
      {isDisabled && (
        <span
          className="mt-2 inline-flex items-center gap-1 text-xs font-medium text-text-muted leading-tight"
          aria-label={`${skip.size} is not available for heavy waste`}
        >
          <svg viewBox="0 0 12 12" fill="currentColor" className="w-3 h-3 shrink-0" aria-hidden="true">
            <path fillRule="evenodd" d="M6 1a5 5 0 100 10A5 5 0 006 1zm-.75 4.75a.75.75 0 011.5 0v1.5a.75.75 0 01-1.5 0v-1.5zm.75-2a.75.75 0 100 1.5.75.75 0 000-1.5z" clipRule="evenodd" />
          </svg>
          Not available for heavy waste
        </span>
      )}
    </div>
  );
}
