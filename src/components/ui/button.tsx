import * as React from "react";

export const Button = React.forwardRef<
  HTMLButtonElement,
  React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: "default" | "outline" }
>(({ className, variant = "default", ...props }, ref) => {
  const base = "px-4 py-2 rounded font-medium";
  const variants = {
    default: "bg-green-600 text-white hover:bg-green-700",
    outline: "border border-green-600 text-green-700 hover:bg-green-50",
  };
  return <button className={`${base} ${variants[variant]} ${className}`} ref={ref} {...props} />;
});
Button.displayName = "Button";
