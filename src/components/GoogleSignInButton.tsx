// src/components/GoogleSignInButton.tsx
"use client";

import { MouseEventHandler, forwardRef } from "react";
import { signIn } from "next-auth/react";

type Props = {
  label?: string;
  callbackUrl?: string;
  className?: string;
  onClick?: MouseEventHandler<HTMLButtonElement>; // opcional: sobrescreve o signIn
};

const GoogleSignInButton = forwardRef<HTMLButtonElement, Props>(
  (
    {
      label = "Continue with Google",
      callbackUrl = "/protected/dashboard",
      className = "",
      onClick,
    },
    ref
  ) => {
    const handleClick: MouseEventHandler<HTMLButtonElement> = (e) => {
      if (onClick) return onClick(e);
      signIn("google", { callbackUrl });
    };

    return (
      <button
        ref={ref}
        type="button"
        onClick={handleClick}
        className={[
          "w-full py-2 mt-4 px-4 border rounded flex items-center justify-center gap-2",
          "dark:text-white", // mantém compatível com seu tema
          className,
        ].join(" ")}
        aria-label={label}
      >
        {/* Ícone Google (SVG inline, sem libs) */}
        <svg
          aria-hidden="true"
          width="18"
          height="18"
          viewBox="0 0 48 48"
          className="shrink-0"
        >
          <path
            fill="#FFC107"
            d="M43.611 20.083H42V20H24v8h11.303C33.887 32.658 29.35 36 24 36 16.82 36 11 30.18 11 23S16.82 10 24 10c3.181 0 6.073 1.205 8.291 3.176l5.657-5.657C34.902 4.012 29.712 2 24 2 12.954 2 3.999 10.955 3.999 22S12.954 42 24 42c11.046 0 20-8.955 20-20 0-1.341-.138-2.651-.389-3.917z"
          />
          <path
            fill="#FF3D00"
            d="M6.306 14.691l6.571 4.817C14.46 16.136 18.865 13 24 13c3.181 0 6.073 1.205 8.291 3.176l5.657-5.657C34.902 4.012 29.712 2 24 2 16.318 2 9.597 6.337 6.306 14.691z"
          />
          <path
            fill="#4CAF50"
            d="M24 42c5.258 0 10.06-2.01 13.651-5.289l-6.305-5.33C29.35 36 24 36 24 36c-5.33 0-9.856-3.322-11.29-7.79l-6.54 5.04C9.402 37.663 16.118 42 24 42z"
          />
          <path
            fill="#1976D2"
            d="M43.611 20.083H42V20H24v8h11.303c-1.083 3.314-3.87 5.89-7.657 6.888l6.305 5.33C37.024 37.668 40 31.667 40 24c0-1.341-.138-2.651-.389-3.917z"
          />
        </svg>

        <span>{label}</span>
      </button>
    );
  }
);

GoogleSignInButton.displayName = "GoogleSignInButton";
export default GoogleSignInButton;
