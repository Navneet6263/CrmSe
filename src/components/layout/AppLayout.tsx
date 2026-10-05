import { Outlet } from "react-router-dom";
import { AppSidebar } from "./AppSidebar";
import { AppHeader } from "./AppHeader";
import { MobileNav } from "./MobileNav";
import { AppSidebarProvider } from "@/contexts/SidebarContext";
import { AIAssistButton } from "@/components/ai/AIAssistButton";

export function AppLayout() {
  return (
    <AppSidebarProvider>
      <div className="flex h-screen bg-background w-full">
        <AppSidebar />
        <div className="flex-1 flex flex-col overflow-hidden min-w-0">
          <AppHeader />
          <main className="flex-1 overflow-y-auto px-3 sm:px-4 md:px-6 pb-4 sm:pb-6">
            <Outlet />
          </main>
        </div>
        <MobileNav />
        <AIAssistButton />
      </div>
    </AppSidebarProvider>
  );
}
