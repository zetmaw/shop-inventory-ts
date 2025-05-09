import React from "react";

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: string;
};

export function Button({
  variant,
  className = '',
  ...props
}: ButtonProps) {
  return (
    <button
      {...props}
      data-variant={variant}
      className={`px-3 py-2 rounded bg-gray-200 hover:bg-gray-300 ${className}`}
    >
      {props.children}
    </button>
  );
}
