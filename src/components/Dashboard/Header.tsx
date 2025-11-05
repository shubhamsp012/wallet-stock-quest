import { Moon, Sun, LogOut, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTheme } from "@/contexts/ThemeContext";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate, useLocation } from "react-router-dom";

export const Header = () => {
  const { theme, toggleTheme } = useTheme();
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/50 bg-background/80 backdrop-blur-xl">
      <div className="container flex h-20 items-center justify-between px-6">
        <div className="flex items-center gap-12">
          <div className="flex items-center gap-3 cursor-pointer group" onClick={() => navigate('/')}>
            <div className="p-2 rounded-xl bg-primary text-primary-foreground transition-transform group-hover:scale-105">
              <TrendingUp className="h-5 w-5" />
            </div>
            <span className="text-2xl font-light tracking-tight">Fingrow</span>
          </div>
          <nav className="hidden md:flex items-center gap-8 text-sm">
            <button
              onClick={() => navigate('/')}
              className={`transition-all hover:text-foreground ${
                location.pathname === '/' ? 'text-foreground' : 'text-muted-foreground'
              }`}
            >
              Home
            </button>
            <button
              onClick={() => navigate('/dashboard')}
              className={`transition-all hover:text-foreground ${
                location.pathname === '/dashboard' ? 'text-foreground' : 'text-muted-foreground'
              }`}
            >
              Dashboard
            </button>
            <button
              onClick={() => navigate('/portfolio')}
              className={`transition-all hover:text-foreground ${
                location.pathname === '/portfolio' ? 'text-foreground' : 'text-muted-foreground'
              }`}
            >
              Portfolio
            </button>
            <button
              onClick={() => navigate('/news')}
              className={`transition-all hover:text-foreground ${
                location.pathname === '/news' ? 'text-foreground' : 'text-muted-foreground'
              }`}
            >
              News
            </button>
            <button
              onClick={() => navigate('/transactions')}
              className={`transition-all hover:text-foreground ${
                location.pathname === '/transactions' ? 'text-foreground' : 'text-muted-foreground'
              }`}
            >
              Transactions
            </button>
          </nav>
        </div>
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleTheme}
            className="rounded-full h-10 w-10"
          >
            {theme === "light" ? (
              <Moon className="h-4 w-4" />
            ) : (
              <Sun className="h-4 w-4" />
            )}
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={signOut}
            className="rounded-full h-10 w-10"
          >
            <LogOut className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </header>
  );
};
