import React from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  as?: 'div' | 'section' | 'article';
}

export function Card({ children, className = '', as: Tag = 'div' }: CardProps) {
  return (
    <Tag
      className={[
        'bg-surface rounded-card border border-border shadow-card',
        className,
      ].join(' ')}
    >
      {children}
    </Tag>
  );
}
