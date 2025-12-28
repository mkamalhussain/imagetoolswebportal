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

type AnchorProps = {
  href?: string;
  target?: string;
  rel?: string;
};

type ButtonSpecificProps = {
  type?: "button" | "submit" | "reset";
  onClick?: React.MouseEventHandler<HTMLElement>;
};

type LabelProps = {
  htmlFor?: string;
};

type ButtonProps = CommonProps &
  (
    | ({ as?: "button" } & ButtonSpecificProps)
    | ({ as: "label" } & LabelProps)
    | ({ as: "a" } & AnchorProps)
  );

export default function Button({
  as = "button",
  variant = "default",
  className = "",
  children,
  disabled,
  ...rest
}: ButtonProps): React.JSX.Element {
  const base =
    "inline-flex items-center justify-center gap-2 px-4 py-2 text-base rounded-md font-semibold transition-all duration-200 " +
    "focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed";

  const variants: Record<Variant, string> = {
    primary: "bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500",
    secondary: "bg-gray-200 text-gray-800 hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600 focus:ring-gray-400",
    default: "bg-white text-gray-800 hover:bg-gray-100 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600 border border-gray-300 dark:border-gray-600 focus:ring-gray-400",
  };

  const classes = `${base} ${variants[variant]} ${className}`.trim();

  if (as === "label") {
    const { htmlFor } = rest as LabelProps;
    return (
      <label className={classes} htmlFor={htmlFor}>
        {children}
      </label>
    );
  }

  if (as === "a") {
    const { href, target, rel } = rest as AnchorProps;
    return (
      <a className={classes} href={href} target={target} rel={rel} aria-disabled={disabled}>
        {children}
      </a>
    );
  }

  const { type, onClick } = rest as ButtonSpecificProps;
  return (
    <button className={classes} type={type} disabled={disabled} onClick={onClick}>
      {children}
    </button>
  );
}