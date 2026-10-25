import React, { createContext, useContext, useState } from "react";

export interface LayoutContextType {
  mobileSiderOpen: boolean;
  setMobileSiderOpen: (open: boolean) => void;
  siderCollapsed: boolean;
  setSiderCollapsed: (collapsed: boolean) => void;
}

export const LayoutContext = createContext<LayoutContextType>({
  mobileSiderOpen: false,
  setMobileSiderOpen: () => {},
  siderCollapsed: false,
  setSiderCollapsed: () => {},
});

export const useLayout = () => useContext(LayoutContext);
export const useThemedLayoutContext = () => useContext(LayoutContext);

export const LayoutProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [mobileSiderOpen, setMobileSiderOpen] = useState(false);
  const [siderCollapsed, setSiderCollapsed] = useState(false);

  return (
    <LayoutContext.Provider
      value={{
        mobileSiderOpen,
        setMobileSiderOpen,
        siderCollapsed,
        setSiderCollapsed,
      }}
    >
      {children}
    </LayoutContext.Provider>
  );
};
