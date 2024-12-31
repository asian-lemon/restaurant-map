
// src/components/ui/button.tsx
import React, { forwardRef } from 'react';
import clsx from 'clsx';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'outline' | 'text';
  size?: 'sm' | 'md' | 'lg';
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    { className, variant = 'default', size = 'md', ...props },
    ref
  ) => {
    return (
      <button
        ref={ref}
        className={clsx(
          'inline-flex items-center justify-center rounded-md font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2',
          variant === 'default' && 'bg-blue-600 text-white hover:bg-blue-700',
          variant === 'outline' && 'border border-blue-600 text-blue-600 hover:bg-blue-100',
          variant === 'text' && 'text-blue-600 hover:bg-blue-100',
          size === 'sm' && 'px-3 py-2 text-sm',
          size === 'md' && 'px-4 py-2.5 text-base',
          size === 'lg' && 'px-6 py-3 text-lg',
          className
        )}
        {...props}
      />
    );
  }
);

interface IconButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'outline' | 'text';
  size?: 'sm' | 'md' | 'lg';
}

export const IconButton = forwardRef<HTMLButtonElement, IconButtonProps>(
  (
    { className, variant = 'default', size = 'md', ...props },
    ref
  ) => {
    return (
      <button
        ref={ref}
        className={clsx(
          'inline-flex items-center justify-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2',
          variant === 'default' && 'bg-blue-600 text-white hover:bg-blue-700',
          variant === 'outline' && 'border border-blue-600 text-blue-600 hover:bg-blue-100',
          variant === 'text' && 'text-blue-600 hover:bg-blue-100',
          size === 'sm' && 'p-2',
          size === 'md' && 'p-3',
          size === 'lg' && 'p-4',
          className
        )}
        {...props}
      />
    );
  }
);

export default Button;


