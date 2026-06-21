import React from 'react';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  variant?: 'default' | 'glass' | 'glow';
  hoverEffect?: boolean;
}

export const Card: React.FC<CardProps> = ({
  children,
  variant = 'default',
  hoverEffect = false,
  className = '',
  ...props
}) => {
  const cardClass = `card card-${variant} ${hoverEffect ? 'card-hover' : ''} ${className}`;
  
  return (
    <div className={cardClass} {...props}>
      {children}
    </div>
  );
};
