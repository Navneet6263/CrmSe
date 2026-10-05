import { createContext, useContext, useState, ReactNode } from "react";

interface AppSidebarContextType {
  collapsed: boolean;
  setCollapsed: (collapsed: boolean) => void;
  toggle: () => void;
  mobileOpen: boolean;
  setMobileOpen: (open: boolean) => void;
  toggleMobile: () => void;
}

const AppSidebarContext = createContext<AppSidebarContextType | undefined>(undefined);

export function AppSidebarProvider({ children }: { children: ReactNode }) {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const toggle = () => setCollapsed((prev) => !prev);
  const toggleMobile = () => setMobileOpen((prev) => !prev);

  return (
    <AppSidebarContext.Provider value={{ collapsed, setCollapsed, toggle, mobileOpen, setMobileOpen, toggleMobile }}>
      {children}
    </AppSidebarContext.Provider>
  );
}

export function useAppSidebar() {
  const context = useContext(AppSidebarContext);
  if (context === undefined) {
    throw new Error("useAppSidebar must be used within an AppSidebarProvider");
  }
  return context;
}
