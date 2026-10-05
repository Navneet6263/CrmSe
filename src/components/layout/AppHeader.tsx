import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Search, Settings, LogOut, User, ChevronDown, PanelLeft, Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { NotificationDropdown } from "@/components/notifications/NotificationDropdown";
import { useAppSidebar } from "@/contexts/SidebarContext";

export function AppHeader() {
  const [searchQuery, setSearchQuery] = useState("");
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const { collapsed, toggle, toggleMobile } = useAppSidebar();

  const handleSignOut = async () => {
    await signOut();
    toast.success("Signed out successfully");
    navigate("/");
  };

  const userInitials = user?.user_metadata?.full_name
    ? user.user_metadata.full_name
        .split(" ")
        .map((n: string) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    : user?.email?.slice(0, 2).toUpperCase() || "U";

  const displayName = user?.user_metadata?.full_name || user?.email || "User";

  return (
    <header className="h-14 sm:h-16 border-b border-border bg-background/80 backdrop-blur-sm flex items-center justify-between px-3 sm:px-4 md:px-6 gap-2 sm:gap-4">
      {/* Mobile Menu Button + Expand Sidebar Button + Search */}
      <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0">
        {/* Mobile menu button */}
        <Button
          variant="ghost"
          size="icon-sm"
          onClick={toggleMobile}
          className="text-muted-foreground hover:text-foreground flex-shrink-0 md:hidden"
        >
          <Menu className="w-5 h-5" />
        </Button>
        
        {/* Desktop expand sidebar button */}
        {collapsed && (
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={toggle}
            className="text-muted-foreground hover:text-foreground flex-shrink-0 hidden md:flex"
          >
            <PanelLeft className="w-4 h-4" />
          </Button>
        )}
        <div className="relative flex-1 min-w-0">
          <Search className="absolute left-2.5 sm:left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-8 sm:pl-10 bg-muted/50 border-transparent focus:border-border focus:bg-background text-sm"
          />
        </div>
      </div>

      {/* Right Actions */}
      <div className="flex items-center gap-1 sm:gap-2 flex-shrink-0">
        {/* Notifications */}
        <NotificationDropdown />

        {/* User Menu */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="gap-1 sm:gap-2 px-1.5 sm:px-2">
              <Avatar className="w-7 h-7 sm:w-8 sm:h-8">
                <AvatarImage src={user?.user_metadata?.avatar_url} />
                <AvatarFallback className="bg-primary/10 text-primary text-xs sm:text-sm font-medium">
                  {userInitials}
                </AvatarFallback>
              </Avatar>
              <div className="hidden md:block text-left">
                <p className="text-sm font-medium truncate max-w-[120px]">{displayName}</p>
              </div>
              <ChevronDown className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-muted-foreground hidden sm:block" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <div className="px-2 py-1.5">
              <p className="text-sm font-medium truncate">{displayName}</p>
              <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
            </div>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link to="/app/settings" className="cursor-pointer">
                <Settings className="w-4 h-4 mr-2" />
                Settings
              </Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleSignOut} className="cursor-pointer text-destructive focus:text-destructive">
              <LogOut className="w-4 h-4 mr-2" />
              Log out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
