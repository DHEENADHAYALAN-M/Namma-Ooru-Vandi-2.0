import { ReactNode } from "react";
import { Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/use-demo-auth";
import { Button } from "@/components/ui/button";
import { LogOut, MapPin, User as UserIcon } from "lucide-react";

export default function Layout({ children }: { children: ReactNode }) {
  const { user, logout } = useAuth();
  const [location] = useLocation();

  // Simple null check for user availability
  if (user === undefined) return null;

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      {/* Header */}
      <header className="flex-none bg-white border-b border-gray-200 px-4 py-3 z-20 shadow-sm relative">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <Link href={user ? (user.role === 'driver' ? '/driver' : '/dashboard') : '/'}>
            <div className="flex items-center gap-2 cursor-pointer group">
              <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center text-white shadow-lg group-hover:scale-105 transition-transform">
                <MapPin strokeWidth={2.5} />
              </div>
              <div className="flex flex-col">
                <span className="font-display font-bold text-xl leading-none text-foreground tracking-tight">
                  Namma Ooru Vandi
                </span>
                <span className="text-xs text-muted-foreground font-medium uppercase tracking-wider">
                  Transit Tracker
                </span>
              </div>
            </div>
          </Link>

          <div className="flex items-center gap-4">
            {user ? (
              <div className="flex items-center gap-3">
                <div className="hidden md:flex flex-col items-end">
                  <span className="text-sm font-semibold">{user.name}</span>
                  <span className="text-xs text-muted-foreground capitalize bg-gray-100 px-2 py-0.5 rounded-full">
                    {user.role}
                  </span>
                </div>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  onClick={() => logout()}
                  className="text-muted-foreground hover:text-destructive transition-colors"
                >
                  <LogOut size={20} />
                </Button>
              </div>
            ) : (
              location !== "/" && (
                <Link href="/">
                  <Button variant="default">Login</Button>
                </Link>
              )
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 relative overflow-hidden">
        {children}
      </main>
    </div>
  );
}
