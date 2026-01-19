import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { 
  Leaf, 
  Plus, 
  Gift, 
  Ticket, 
  Shield, 
  LogOut, 
  User,
  Menu,
  Home
} from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { label: "Feed", path: "/", icon: Home },
  { label: "Create Listing", path: "/create", icon: Plus },
  { label: "Rewards", path: "/rewards", icon: Gift },
  { label: "My Codes", path: "/my-codes", icon: Ticket },
];

export const Navbar = () => {
  const { user, profile, isAdmin, signOut } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    navigate("/auth");
  };

  return (
    <nav className="sticky top-0 z-50 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2 font-bold text-xl">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary">
            <Leaf className="h-5 w-5 text-primary-foreground" />
          </div>
          <span className="text-gradient-swap">SWAP</span>
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center gap-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            return (
              <Link key={item.path} to={item.path}>
                <Button
                  variant={isActive ? "secondary" : "ghost"}
                  className={cn(
                    "gap-2 transition-all",
                    isActive && "bg-muted"
                  )}
                >
                  <Icon className="h-4 w-4" />
                  {item.label}
                </Button>
              </Link>
            );
          })}
          
          {isAdmin && (
            <Link to="/admin">
              <Button
                variant={location.pathname === "/admin" ? "secondary" : "ghost"}
                className={cn(
                  "gap-2 text-swap-gold",
                  location.pathname === "/admin" && "bg-muted"
                )}
              >
                <Shield className="h-4 w-4" />
                Admin
              </Button>
            </Link>
          )}
        </div>

        {/* User Section */}
        <div className="flex items-center gap-3">
          {/* Points Badge */}
          {profile && (
            <div className="hidden sm:flex items-center gap-2 rounded-full bg-muted px-4 py-2">
              <Leaf className="h-4 w-4 text-primary" />
              <span className="font-semibold text-sm">
                {profile.swap_points.toLocaleString()} pts
              </span>
            </div>
          )}

          {/* User Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="gap-2">
                <User className="h-4 w-4" />
                <span className="hidden sm:inline max-w-[120px] truncate">
                  {profile?.display_name || user?.email}
                </span>
                <Menu className="h-4 w-4 sm:hidden" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56 bg-popover">
              <div className="px-2 py-1.5">
                <p className="text-sm font-medium">{profile?.display_name}</p>
                <p className="text-xs text-muted-foreground">{user?.email}</p>
              </div>
              <DropdownMenuSeparator />
              
              {/* Mobile Navigation */}
              <div className="md:hidden">
                {navItems.map((item) => {
                  const Icon = item.icon;
                  return (
                    <DropdownMenuItem key={item.path} asChild>
                      <Link to={item.path} className="flex items-center gap-2">
                        <Icon className="h-4 w-4" />
                        {item.label}
                      </Link>
                    </DropdownMenuItem>
                  );
                })}
                {isAdmin && (
                  <DropdownMenuItem asChild>
                    <Link to="/admin" className="flex items-center gap-2 text-swap-gold">
                      <Shield className="h-4 w-4" />
                      Admin
                    </Link>
                  </DropdownMenuItem>
                )}
                <DropdownMenuSeparator />
              </div>
              
              <DropdownMenuItem asChild>
                <div className="flex items-center gap-2 sm:hidden">
                  <Leaf className="h-4 w-4 text-primary" />
                  <span>{profile?.swap_points.toLocaleString()} SWAP Points</span>
                </div>
              </DropdownMenuItem>
              
              <DropdownMenuItem onClick={handleSignOut} className="text-destructive">
                <LogOut className="h-4 w-4 mr-2" />
                Sign Out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </nav>
  );
};
