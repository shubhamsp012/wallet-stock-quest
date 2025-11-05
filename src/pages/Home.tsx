import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Header } from "@/components/Dashboard/Header";
import { Card, CardHeader } from "@/components/ui/card";
import { LayoutDashboard, Newspaper, TrendingUp, Loader2 } from "lucide-react";

const Home = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && !user) {
      navigate("/auth");
    }
  }, [user, loading, navigate]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) {
    return null;
  }

  const sections = [
    {
      title: "Dashboard",
      description: "View stocks, watchlist, and trading",
      icon: LayoutDashboard,
      path: "/dashboard",
      gradient: "from-blue-500 to-cyan-500",
    },
    {
      title: "News",
      description: "Latest market news and updates",
      icon: Newspaper,
      path: "/news",
      gradient: "from-purple-500 to-pink-500",
    },
    {
      title: "Portfolio",
      description: "Track your investments",
      icon: TrendingUp,
      path: "/portfolio",
      gradient: "from-green-500 to-emerald-500",
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-6 py-20">
        <div className="max-w-5xl mx-auto text-center mb-20">
          <h1 className="text-6xl md:text-7xl font-light mb-8 tracking-tight">
            Welcome to Fingrow
          </h1>
          <p className="text-xl text-muted-foreground font-light max-w-2xl mx-auto leading-relaxed">
            Your intelligent stock trading companion. Track, analyze, and grow your portfolio with confidence.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {sections.map((section) => {
            const Icon = section.icon;
            return (
              <Card
                key={section.path}
                className="group cursor-pointer transition-all hover:shadow-lg hover:-translate-y-1 bg-card/50 backdrop-blur"
                onClick={() => navigate(section.path)}
              >
                <CardHeader className="space-y-4">
                  <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                    <Icon className="h-7 w-7 text-primary" />
                  </div>
                  <h2 className="text-xl font-light">{section.title}</h2>
                  <p className="text-base leading-relaxed text-muted-foreground">{section.description}</p>
                </CardHeader>
              </Card>
            );
          })}
        </div>
      </main>
    </div>
  );
};

export default Home;
