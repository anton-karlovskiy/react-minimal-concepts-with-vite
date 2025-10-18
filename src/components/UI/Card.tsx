import { ReactNode } from "react";

interface CardProps {
  children: ReactNode;
  className?: string;
}

export default function Card({ children, className = "" }: CardProps) {
  return (
    <div className={`bg-[#131417] border border-[#24262b] rounded-xl p-4 ${className}`}>
      {children}
    </div>
  );
}
