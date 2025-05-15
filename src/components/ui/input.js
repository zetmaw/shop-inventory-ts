import { jsx as _jsx } from "react/jsx-runtime";
export function Input(props) {
    return (_jsx("input", { ...props, className: `border rounded px-2 py-1 w-full ${props.className ?? ''}` }));
}
