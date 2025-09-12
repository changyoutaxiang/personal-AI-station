import React from 'react';

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  className?: string;
}

export const Textarea: React.FC<TextareaProps> = ({ className = '', ...props }) => {
  return (
    <textarea
      className={`block w-full rounded-md border px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 ${className}`}
      {...props}
    />
  );
};

export default Textarea;