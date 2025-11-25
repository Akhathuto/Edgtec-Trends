import React from 'react';

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
	className?: string;
};

export const Button: React.FC<ButtonProps> = ({ className = '', children, ...props }) => {
	return (
		<button
			{...props}
			className={`inline-flex items-center gap-2 px-4 py-2 rounded-md bg-violet-600 hover:bg-violet-500 text-white font-semibold disabled:opacity-50 ${className}`}
		>
			{children}
		</button>
	);
};

export default Button;
