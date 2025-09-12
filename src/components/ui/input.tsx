import React from 'react';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  className?: string;
}

export const Input: React.FC<InputProps> = ({ className = '', ...props }) => {
  return (
    <input
      className={`block w-full rounded-md border px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 ${className}`}
      {...props}
    />
  );
};

export default Input;