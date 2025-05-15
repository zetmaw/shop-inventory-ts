import { jsx as _jsx } from "react/jsx-runtime";
export function Card({ children, className = '' }) {
    return _jsx("div", { className: `rounded border p-2 ${className}`, children: children });
}
export function CardContent({ children, className = '' }) {
    return _jsx("div", { className: className, children: children });
}
