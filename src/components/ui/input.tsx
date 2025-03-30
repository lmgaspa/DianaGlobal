import React from "react";

export const Input = (props: React.InputHTMLAttributes<HTMLInputElement>) => (
  <input
    {...props}
    className="w-full p-2 bg-transparent border dark:text-white border-gray-600 rounded-md text-black mr-4 focus:outline-none"
  />
);
