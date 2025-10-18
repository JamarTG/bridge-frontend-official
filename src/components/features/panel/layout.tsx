import type { ReactNode } from "react";

interface PanelLayoutProps {
  children: ReactNode;
  className?: string;
}

const PanelLayout: React.FC<PanelLayoutProps> = ({ children, className }) => {
  return (
    <div className={`flex flex-col justify-start items-center ${className || ""}`}>
      {children}
    </div>
  );
};

export default PanelLayout;
