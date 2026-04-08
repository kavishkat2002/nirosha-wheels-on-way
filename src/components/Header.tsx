import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Bus, Shield, User, Ticket, LogOut, Loader2, Menu, Home, Phone, Info, X, HelpCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetClose,
} from "@/components/ui/sheet";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useAdminCheck } from "@/hooks/useAdminCheck";
import { ModeToggle } from "@/components/mode-toggle";
import { cn } from "@/lib/utils";

export function Header() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, loading, signOut } = useAuth();
  const { isAdmin } = useAdminCheck();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  const isHome = location.pathname === "/";

  const navLinks = [
    { name: "Home", href: "/", icon: Home },
    { name: "My Bookings", href: "/my-bookings", icon: Ticket },
    { name: "About Us", href: "/about", icon: Info },
    { name: "FAQ", href: "/faq", icon: HelpCircle },
    { name: "Contact", href: "/contact", icon: Phone },
  ];

  const NavLink = ({ item, mobile = false }: { item: typeof navLinks[0], mobile?: boolean }) => {
    const isActive = location.pathname === item.href;
    const Icon = item.icon;

    if (mobile) {
      return (
        <Link
          to={item.href}
          onClick={() => setIsOpen(false)}
          className={cn(
            "flex items-center gap-3 px-4 py-3 rounded-xl transition-colors",
            isActive
              ? "bg-primary/10 text-primary font-semibold"
              : "text-muted-foreground hover:bg-muted hover:text-foreground"
          )}
        >
          <Icon className="h-5 w-5" />
          {item.name}
        </Link>
      );
    }

    // Logic: White text only if on Home AND not scrolled. Otherwise darker text.
    const isTransparent = isHome && !isScrolled;

    return (
      <Link
        to={item.href}
        className={cn(
          "relative px-4 py-2 text-sm font-medium transition-colors hover:text-primary",
          isActive
            ? "text-primary bg-primary/10 rounded-full"
            : isTransparent
              ? "text-white/80 hover:text-white hover:bg-white/10 rounded-full"
              : "text-foreground/80 hover:text-foreground hover:bg-muted rounded-full"
        )}
      >
        {isActive && (
          <motion.div
            layoutId="activeNav"
            className="absolute inset-0 bg-primary/10 rounded-full"
            transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
          />
        )}
        <span className="relative z-10 flex items-center gap-2">
          {item.name}
        </span>
      </Link>
    );
  };

  return (
    <motion.header
      className={cn(
        "fixed top-0 left-0 right-0 z-50 transition-all duration-300 border-b",
        (isScrolled || !isHome)
          ? "bg-background/80 backdrop-blur-xl border-border/40 shadow-sm py-2"
          : "bg-transparent border-transparent py-4 text-white"
      )}
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
    >
      <div className="container mx-auto px-4 flex items-center justify-between">
        {/* Logo Section */}
        <Link to="/" className="flex items-center gap-3 group">
          <motion.div
            className="relative"
            whileHover={{ rotate: 10 }}
            whileTap={{ scale: 0.9 }}
          >
            <div className="absolute inset-0 bg-primary/20 blur-xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />
            <div className={cn(
              "p-2 rounded-xl transition-colors",
              (isScrolled || !isHome) ? "bg-primary/10" : "bg-background/20 backdrop-blur-sm"
            )}>
              <img
                src="/images/ne-logo.jpg"
                alt="Nirosha"
                className="h-8 w-8 object-contain rounded-md"
              />
            </div>
          </motion.div>
          <div className="flex flex-col">
            <span className={cn(
              "font-bold text-[10px] sm:text-lg leading-none tracking-tight",
              (isScrolled || !isHome) ? "text-foreground" : "text-white"
            )}>
              NIROSHA ENTERPRISES
            </span>
            <span className={cn(
              "text-[8px] sm:text-[10px] font-medium tracking-widest uppercase opacity-70",
              (isScrolled || !isHome) ? "text-muted-foreground" : "text-white/80"
            )}>
              Passenger Service
            </span>
          </div>
        </Link>

        {/* Desktop Navigation */}
        {!location.pathname.startsWith('/admin') && (
          <nav className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => (
              (!user && link.href === "/my-bookings") ? null : (
                <NavLink key={link.href} item={link} />
              )
            ))}
          </nav>
        )}

        {/* Right Actions */}
        <div className="flex items-center gap-1 sm:gap-3">
          <ModeToggle />

          <div className="hidden md:flex items-center gap-2">
            {loading ? (
              <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
            ) : user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="relative rounded-full">
                    <AvatarWrapper user={user} />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-60 p-2" forceMount>
                  <div className="flex items-center gap-3 p-2">
                    <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                      {user.user_metadata?.full_name?.charAt(0) || "U"}
                    </div>
                    <div className="flex flex-col">
                      <p className="text-sm font-medium">{user.user_metadata?.full_name || "User"}</p>
                      <p className="text-xs text-muted-foreground truncate max-w-[140px]">{user.email}</p>
                    </div>
                  </div>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => navigate("/profile")} className="cursor-pointer">
                    <User className="mr-2 h-4 w-4" /> Profile
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => navigate("/my-bookings")} className="cursor-pointer">
                    <Ticket className="mr-2 h-4 w-4" /> My Bookings
                  </DropdownMenuItem>
                  {isAdmin && (
                    <DropdownMenuItem onClick={() => navigate("/admin")} className="cursor-pointer">
                      <Shield className="mr-2 h-4 w-4" /> Admin Dashboard
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleSignOut} className="cursor-pointer text-destructive focus:text-destructive">
                    <LogOut className="mr-2 h-4 w-4" /> Sign Out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <div className="flex items-center gap-2">
                <Button variant="ghost" asChild>
                  <Link to="/auth">Login</Link>
                </Button>
                <Button asChild className="shadow-lg shadow-primary/20">
                  <Link to="/auth">Sign Up</Link>
                </Button>
              </div>
            )}
          </div>

          {/* Mobile Menu Toggle */}
          <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="md:hidden">
                <Menu className="h-6 w-6" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[300px] sm:w-[350px] p-0">
              <SheetHeader className="p-6 border-b">
                <SheetTitle className="flex items-center gap-2">
                  <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center">
                    <Bus className="h-4 w-4 text-primary" />
                  </div>
                  <div className="flex flex-col items-start">
                    <span>NIROSHA ENTERPRISES</span>
                    <span className="text-[10px] text-muted-foreground font-normal uppercase tracking-widest">Passenger Service</span>
                  </div>
                </SheetTitle>
              </SheetHeader>

              <div className="flex flex-col py-6 px-4 space-y-6 h-full overflow-y-auto">
                {!location.pathname.startsWith('/admin') && (
                  <div className="space-y-2">
                    <p className="px-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                      Navigation
                    </p>
                    {navLinks.map((link) => (
                      (!user && link.href === "/my-bookings") ? null : (
                        <NavLink key={link.href} item={link} mobile />
                      )
                    ))}
                  </div>
                )}

                {user && (
                  <div className="space-y-2">
                    <p className="px-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                      Account
                    </p>
                    <Link
                      to="/profile"
                      onClick={() => setIsOpen(false)}
                      className="flex items-center gap-3 px-4 py-3 rounded-xl text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
                    >
                      <User className="h-5 w-5" />
                      Profile
                    </Link>
                    {isAdmin && (
                      <Link
                        to="/admin"
                        onClick={() => setIsOpen(false)}
                        className="flex items-center gap-3 px-4 py-3 rounded-xl text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
                      >
                        <Shield className="h-5 w-5" />
                        Admin Panel
                      </Link>
                    )}
                    <button
                      onClick={() => {
                        handleSignOut();
                        setIsOpen(false);
                      }}
                      className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-destructive hover:bg-destructive/10 transition-colors text-left"
                    >
                      <LogOut className="h-5 w-5" />
                      Sign Out
                    </button>
                  </div>
                )}

                {!user && (
                  <div className="mt-auto p-4 bg-muted/30 rounded-2xl border border-border/50">
                    <p className="text-sm text-center mb-4 text-muted-foreground">
                      Sign in to manage your bookings and profile
                    </p>
                    <div className="grid grid-cols-2 gap-3">
                      <Button variant="outline" asChild onClick={() => setIsOpen(false)}>
                        <Link to="/auth">Login</Link>
                      </Button>
                      <Button asChild onClick={() => setIsOpen(false)}>
                        <Link to="/auth">Sign Up</Link>
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </motion.header>
  );
}

// Helper for avatar (to avoid clutter)
const AvatarWrapper = ({ user }: { user: any }) => {
  const initials = user.user_metadata?.full_name
    ?.split(" ")
    .map((n: string) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase() || "U";

  return (
    <div className="h-9 w-9 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-medium shadow-md">
      {initials}
    </div>
  );
};
