type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: string;
};

export function Button({ variant, className = '', ...props }: ButtonProps) {
  return (
    <button
      className={`px-3 py-1 rounded border bg-gray-100 hover:bg-gray-200 ${className}`}
      data-variant={variant}
      {...props}
    >
      {props.children}
    </button>
  );
}
