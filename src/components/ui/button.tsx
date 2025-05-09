type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: string;
};

export function Button({
  children,
  variant,
  className,
  ...props
}: ButtonProps) {
  return (
    <button
      {...props}
      className={`px-3 py-2 border rounded ${className}`}
      data-variant={variant}
    >
      {children}
    </button>
  );
}
