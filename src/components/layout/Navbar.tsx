import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
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
  Home,
  Settings,
  Star,
  Trophy,
} from "lucide-react";
import { cn } from "@/lib/utils";

// Level calculation helpers
const xpForLevel = (level: number) => Math.pow(level - 1, 2) * 25;
const xpForNextLevel = (level: number) => Math.pow(level, 2) * 25;

const navItems = [
  { label: "Feed", path: "/", icon: Home },
  { label: "Create Listing", path: "/create", icon: Plus },
  { label: "Saved", path: "/saved", icon: Star },
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

  // Get XP progress
  const currentXp = (profile as any)?.xp || 0;
  const currentLevel = (profile as any)?.level || 1;
  const avatarUrl = (profile as any)?.avatar_url;
  const xpInCurrentLevel = currentXp - xpForLevel(currentLevel);
  const xpNeededForNext = xpForNextLevel(currentLevel) - xpForLevel(currentLevel);
  const levelProgress = xpNeededForNext > 0 ? (xpInCurrentLevel / xpNeededForNext) * 100 : 100;

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
          {/* Points Badge - Clickable */}
          {profile && (
            <Link to="/points-history">
              <div className="hidden sm:flex items-center gap-2 rounded-full bg-muted px-4 py-2 hover:bg-muted/80 transition-colors cursor-pointer">
                <Leaf className="h-4 w-4 text-primary" />
                <span className="font-semibold text-sm">
                  {profile.swap_points.toLocaleString()} pts
                </span>
              </div>
            </Link>
          )}

          {/* User Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="gap-2 pl-2">
                <Avatar className="h-7 w-7">
                  <AvatarImage src={avatarUrl} />
                  <AvatarFallback className="text-xs bg-primary/10">
                    {profile?.display_name?.[0]?.toUpperCase() || <User className="h-3 w-3" />}
                  </AvatarFallback>
                </Avatar>
                <span className="hidden sm:inline max-w-[120px] truncate">
                  {profile?.display_name || user?.email}
                </span>
                <Menu className="h-4 w-4 sm:hidden" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-64 bg-popover">
              {/* User Info with Level */}
              <div className="px-3 py-3">
                <div className="flex items-center gap-3 mb-2">
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={avatarUrl} />
                    <AvatarFallback className="bg-primary/10">
                      {profile?.display_name?.[0]?.toUpperCase() || <User className="h-5 w-5" />}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{profile?.display_name}</p>
                    <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
                  </div>
                </div>
                {/* Level progress */}
                <div className="flex items-center gap-2 mt-3">
                  <div className="flex items-center justify-center h-6 w-6 rounded-full bg-gradient-to-br from-swap-gold to-swap-earth text-xs font-bold text-background">
                    {currentLevel}
                  </div>
                  <div className="flex-1">
                    <Progress value={levelProgress} className="h-1.5" />
                  </div>
                  <Trophy className="h-4 w-4 text-swap-gold" />
                </div>
                <p className="text-xs text-muted-foreground mt-1">Level {currentLevel} · {currentXp} XP</p>
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
              
              <DropdownMenuItem asChild className="sm:hidden">
                <div className="flex items-center gap-2">
                  <Leaf className="h-4 w-4 text-primary" />
                  <span>{profile?.swap_points.toLocaleString()} SWAP Points</span>
                </div>
              </DropdownMenuItem>
              
              <DropdownMenuItem asChild>
                <Link to="/settings" className="flex items-center gap-2">
                  <Settings className="h-4 w-4" />
                  Settings
                </Link>
              </DropdownMenuItem>
              
              <DropdownMenuSeparator />
              
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
