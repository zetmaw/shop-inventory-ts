import { jsx as _jsx } from "react/jsx-runtime";
export function Button({ children, variant, className, ...props }) {
    return (_jsx("button", { ...props, className: `px-3 py-2 border rounded ${className}`, "data-variant": variant, children: children }));
}
