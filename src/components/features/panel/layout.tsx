import type { ReactNode } from "react";

interface PanelLayoutProps {
  children: ReactNode;
  className?: string;
}

const PanelLayout: React.FC<PanelLayoutProps> = ({ children, className }) => {
  return (
    <div className={`${className || ""}`}>
      {children}
    </div>
  );
};

export default PanelLayout;
