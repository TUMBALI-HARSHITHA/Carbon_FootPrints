import React from 'react';

/**
 * Properties for the Button component
 */
interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  /** The children nodes to be rendered inside the button */
  children: React.ReactNode;
  /** The styling variant of the button element */
  variant?: 'primary' | 'secondary' | 'outline' | 'danger';
  /** The padding and font-size scaling token */
  size?: 'sm' | 'md' | 'lg';
}

/**
 * Reusable Button component with custom design variants and sizes
 * @param props Button properties
 * @returns React functional component
 */
export const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  className = '',
  ...props
}) => {
  const btnClass = `btn btn-${variant} btn-${size} ${className}`;
  
  return (
    <button className={btnClass} {...props}>
      {children}
    </button>
  );
};
