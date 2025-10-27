import React from "react";

export const Button = ({ children, ...props }: React.ButtonHTMLAttributes<HTMLButtonElement>) => (
  <button {...props} className="bg:yellow-400 bg-purple-600 hover:bg-purple-500 text-white py-2 px-4 rounded-lg">
    {children}
  </button>
);
