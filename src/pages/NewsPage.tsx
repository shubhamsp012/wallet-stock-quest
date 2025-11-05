import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Header } from "@/components/Dashboard/Header";
import { NewsSection } from "@/components/Dashboard/NewsSection";
import { Loader2 } from "lucide-react";

const NewsPage = () => {
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

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-6 py-10">
        <h1 className="text-4xl font-light mb-3 tracking-tight">Market News</h1>
        <p className="text-muted-foreground mb-10 text-lg font-light">Stay updated with the latest market trends</p>
        <div className="max-w-4xl">
          <NewsSection />
        </div>
      </main>
    </div>
  );
};

export default NewsPage;
