import React from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  as?: 'div' | 'section' | 'article';
  onClick?: () => void;
  'data-testid'?: string;
}

export function Card({ children, className = '', as: Tag = 'div', onClick, 'data-testid': testId }: CardProps) {
  return (
    <Tag
      onClick={onClick}
      data-testid={testId}
      className={[
        'bg-surface rounded-card border border-border shadow-card',
        className,
      ].join(' ')}
    >
      {children}
    </Tag>
  );
}
