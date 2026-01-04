import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";

export function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 rounded-none">
      <div className="glass-card-neutral border-b border-border/30 rounded-none">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between h-16 rounded-none">

            {/* Logo + App Name */}
            <Link to="/" className="flex items-center gap-3 rounded-none">
              <img
                src="/Logo.png"
                alt="Food Intelligence Logo"
                className="w-8 h-8 object-contain rounded-none"
              />
              <span className="font-display text-xl text-foreground hidden sm:block">
                Unlabel
              </span>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center gap-6 rounded-none">
              <NavLink to="/analyze">Analyze</NavLink>
              <NavLink to="/food-search">Food Search</NavLink>

              {isAuthenticated && (
                <NavLink to="/history">History</NavLink>
              )}

              {isAuthenticated ? (
                <>
                  <NavLink to="/profile">{user?.name}</NavLink>
                  <button
                    onClick={handleLogout}
                    className="text-muted-foreground hover:text-foreground transition-colors font-body text-sm rounded-none"
                  >
                    Logout
                  </button>
                </>
              ) : (
                <>
                  <NavLink to="/login">Sign In</NavLink>
                  <Link
                    to="/register"
                    className={cn(
                      "px-4 py-2 border rounded-none",
                      "bg-primary/20 border-primary/30",
                      "text-primary-foreground font-body text-sm",
                      "hover:bg-primary/30 transition-all duration-300"
                    )}
                  >
                    Get Started
                  </Link>
                </>
              )}
            </nav>

            {/* Mobile Menu Toggle */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="md:hidden p-2 text-foreground rounded-none"
              aria-label="Toggle menu"
            >
              ☰
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        <div
          className={cn(
            "md:hidden overflow-hidden transition-all duration-300 rounded-none",
            isMenuOpen ? "max-h-96" : "max-h-0"
          )}
        >
          <nav className="container mx-auto px-4 py-4 flex flex-col gap-3 border-t border-border/30 rounded-none">
            <MobileNavLink to="/analyze" onClick={() => setIsMenuOpen(false)}>
              Analyze
            </MobileNavLink>
            <MobileNavLink to="/food-search" onClick={() => setIsMenuOpen(false)}>
              Food Search
            </MobileNavLink>

            {isAuthenticated && (
              <MobileNavLink to="/history" onClick={() => setIsMenuOpen(false)}>
                History
              </MobileNavLink>
            )}

            {isAuthenticated ? (
              <>
                <MobileNavLink to="/profile" onClick={() => setIsMenuOpen(false)}>
                  Profile
                </MobileNavLink>
                <button
                  onClick={() => {
                    handleLogout();
                    setIsMenuOpen(false);
                  }}
                  className="text-left py-2 text-secondary font-body rounded-none"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <MobileNavLink to="/login" onClick={() => setIsMenuOpen(false)}>
                  Sign In
                </MobileNavLink>
                <MobileNavLink to="/register" onClick={() => setIsMenuOpen(false)}>
                  Get Started
                </MobileNavLink>
              </>
            )}
          </nav>
        </div>
      </div>
    </header>
  );
}

function NavLink({
  to,
  children,
}: {
  to: string;
  children: React.ReactNode;
}) {
  return (
    <Link
      to={to}
      className="text-muted-foreground hover:text-foreground transition-colors font-body text-sm rounded-none"
    >
      {children}
    </Link>
  );
}

function MobileNavLink({
  to,
  children,
  onClick,
}: {
  to: string;
  children: React.ReactNode;
  onClick: () => void;
}) {
  return (
    <Link
      to={to}
      onClick={onClick}
      className="py-2 text-foreground font-body rounded-none"
    >
      {children}
    </Link>
  );
}
