import * as React from "react";

export const Input = React.forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(
  ({ className, ...props }, ref) => {
    return <input className={`border px-3 py-2 rounded ${className}`} ref={ref} {...props} />;
  }
);
Input.displayName = "Input";
