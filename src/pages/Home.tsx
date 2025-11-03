import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Header } from "@/components/Dashboard/Header";
import { Card, CardContent } from "@/components/ui/card";
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
      <main className="container mx-auto px-4 py-12">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4">Welcome to Fingrow</h1>
          <p className="text-muted-foreground text-lg">
            Choose a section to get started with real-time stock trading
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {sections.map((section) => {
            const Icon = section.icon;
            return (
              <Card
                key={section.path}
                className="cursor-pointer hover:shadow-lg transition-all duration-300 hover:-translate-y-1 overflow-hidden group"
                onClick={() => navigate(section.path)}
              >
                <div className={`h-2 bg-gradient-to-r ${section.gradient}`} />
                <CardContent className="p-6">
                  <div className={`w-16 h-16 rounded-lg bg-gradient-to-br ${section.gradient} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                    <Icon className="h-8 w-8 text-white" />
                  </div>
                  <h2 className="text-2xl font-bold mb-2">{section.title}</h2>
                  <p className="text-muted-foreground">{section.description}</p>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </main>
    </div>
  );
};

export default Home;
