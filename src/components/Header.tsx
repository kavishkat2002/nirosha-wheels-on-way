import { Bus, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link, useLocation } from "react-router-dom";

export function Header() {
  const location = useLocation();
  const isAdmin = location.pathname.startsWith('/admin');

  return (
    <header className="bg-primary shadow-lg">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-3">
          <div className="bg-secondary p-2 rounded-lg">
            <Bus className="h-6 w-6 text-secondary-foreground" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-primary-foreground">Nirosha</h1>
            <p className="text-xs text-primary-foreground/80">Passenger Services</p>
          </div>
        </Link>
        
        <nav className="flex items-center gap-4">
          {isAdmin ? (
            <Button variant="secondary" asChild>
              <Link to="/">
                <Bus className="h-4 w-4 mr-2" />
                Book Tickets
              </Link>
            </Button>
          ) : (
            <Button variant="secondary" asChild>
              <Link to="/admin">
                <Shield className="h-4 w-4 mr-2" />
                Admin
              </Link>
            </Button>
          )}
        </nav>
      </div>
    </header>
  );
}
