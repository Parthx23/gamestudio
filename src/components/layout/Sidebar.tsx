import { NavLink, useLocation } from "react-router-dom";
import { 
  Gamepad2, 
  LayoutDashboard, 
  Library, 
  DollarSign, 
  Upload, 
  Users, 
  Settings
} from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { icon: LayoutDashboard, label: "Dashboard", path: "/" },
  { icon: Library, label: "My Games", path: "/games" },
  { icon: Users, label: "Friends", path: "/friends" },
  { icon: Upload, label: "Publishing", path: "/publishing" },
  { icon: DollarSign, label: "Pricing", path: "/pricing" },
];

const Sidebar = () => {
  const location = useLocation();

  return (
    <aside className="fixed left-0 top-0 z-40 h-screen w-64 border-r border-border bg-sidebar flex flex-col">
      {/* Logo */}
      <div className="flex items-center gap-3 px-6 py-6 border-b border-border">
        <div className="relative">
          <Gamepad2 className="h-10 w-10 text-primary" />
          <div className="absolute -inset-1 bg-primary/20 blur-lg rounded-full" />
        </div>
        <div>
          <h1 className="font-gaming text-xl text-gradient">GameStudio</h1>
          <p className="text-xs text-muted-foreground">Play. Create. Connect.</p>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 py-6 space-y-2">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={cn(
                "flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-300 group",
                isActive
                  ? "bg-primary/10 text-primary border border-primary/30"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted"
              )}
            >
              <item.icon className={cn(
                "h-5 w-5 transition-all duration-300",
                isActive && "drop-shadow-[0_0_8px_hsl(var(--primary))]"
              )} />
              <span className="font-medium">{item.label}</span>
              {isActive && (
                <div className="ml-auto w-1.5 h-1.5 rounded-full bg-primary animate-pulse-glow" />
              )}
            </NavLink>
          );
        })}
      </nav>

      {/* Settings */}
      <div className="px-4 pb-6 border-t border-border pt-4">
        <NavLink
          to="/settings"
          className="flex items-center gap-3 px-4 py-3 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-all"
        >
          <Settings className="h-5 w-5" />
          <span className="font-medium">Settings</span>
        </NavLink>
      </div>
    </aside>
  );
};

export default Sidebar;