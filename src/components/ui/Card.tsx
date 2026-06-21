import React from 'react';

/**
 * Properties for the Card component
 */
interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  /** The children nodes to be rendered inside the card */
  children: React.ReactNode;
  /** The styling variant of the card container */
  variant?: 'default' | 'glass' | 'glow';
  /** If true, applies transform translate on hover states */
  hoverEffect?: boolean;
}

/**
 * Reusable Card container component implementing layout panels
 * @param props Card properties
 * @returns React functional component
 */
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
