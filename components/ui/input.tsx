import React from 'react';

type InputProps = React.InputHTMLAttributes<HTMLInputElement> & {
  className?: string;
};

export const Input: React.FC<InputProps> = ({ className = '', ...props }) => {
  return (
    <input
      {...props}
      className={`rounded-md px-3 py-2 border border-slate-700 bg-transparent text-sm text-slate-200 placeholder:text-slate-400 ${className}`}
    />
  );
};

export default Input;
