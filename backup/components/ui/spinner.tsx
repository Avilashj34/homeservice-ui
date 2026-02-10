import React from "react";

interface SpinnerProps {
  size?: "sm" | "md" | "lg";
  className?: string;
}

export const Spinner: React.FC<SpinnerProps> = ({ size = "md", className = "" }) => {
  const sizeClasses = {
    sm: "w-4 h-4",
    md: "w-6 h-6",
    lg: "w-8 h-8",
  };

  return (
    <div className={`${className}`}>
      <div
        className={`${sizeClasses[size]} rounded-full border-4 border-t-[#0B2B4F] border-r-[#0B2B4F] border-b-[#0B2B4F]/40 border-l-[#0B2B4F]/40 animate-spin`}
      />
    </div>
  );
};
