export function Button({
  children,
  className = '',
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      className={`px-3 py-1 border rounded bg-gray-100 hover:bg-gray-200 ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}
