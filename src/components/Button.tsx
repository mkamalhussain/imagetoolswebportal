"use client";

import React from "react";

type Variant = "primary" | "secondary" | "default";
type AsTag = "button" | "label" | "a";

type CommonProps = {
  variant?: Variant;
  className?: string;
  children?: React.ReactNode;
  disabled?: boolean;
};

type ButtonProps = CommonProps & {
  as?: AsTag;
  type?: "button" | "submit" | "reset";
  onClick?: React.MouseEventHandler<HTMLElement>;
  href?: string;
};

export default function Button({
  as = "button",
  variant = "default",
  className = "",
  children,
  disabled,
  type = "button",
  onClick,
  href,
}: ButtonProps) {
  const base =
    "inline-flex items-center gap-2 px-3 py-1.5 rounded-md font-semibold border transition " +
    "focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed";

  const variants: Record<Variant, string> = {
    primary: "bg-blue-600 text-white hover:bg-blue-700 border-blue-700",
    secondary: "bg-gray-200 text-gray-900 hover:bg-gray-300 border-gray-300",
    default: "bg-white text-gray-900 hover:bg-gray-50 border-gray-300",
  };

  const classes = `${base} ${variants[variant]} ${className}`.trim();

  if (as === "label") {
    return (
      <label className={classes}>
        {children}
      </label>
    );
  }

  if (as === "a") {
    return (
      <a className={classes} href={href} onClick={onClick} aria-disabled={disabled}>
        {children}
      </a>
    );
  }

  return (
    <button className={classes} type={type} disabled={disabled} onClick={onClick as any}>
      {children}
    </button>
  );
}