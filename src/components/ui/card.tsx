import React from "react";

interface CardProps {
  children: React.ReactNode;
  className?: string;
}

export const Card = ({ children, className = "" }: CardProps) => (
  <div className={` dark:bg-gray-800 p-4 rounded-lg shadow-md ${className}`}>
    {children}
  </div>
);

export const CardContent = ({ children, className = "" }: CardProps) => (
  <div className={`p-2 ${className}`}>
    {children}
  </div>
);
