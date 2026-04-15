interface SpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  label?: string;
  className?: string;
}

const sizeMap = {
  sm: 'w-4 h-4',
  md: 'w-6 h-6',
  lg: 'w-8 h-8',
};

export function Spinner({ size = 'md', label = 'Loading', className = '' }: SpinnerProps) {
  return (
    <span
      role="status"
      aria-label={label}
      className={`inline-flex items-center justify-center ${className}`}
    >
      <span
        className={`spinner-ring border-primary border-t-primary ${sizeMap[size]}`}
        aria-hidden="true"
      />
      <span className="visually-hidden">{label}</span>
    </span>
  );
}
