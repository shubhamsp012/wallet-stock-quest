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
      <main className="container mx-auto px-4 py-6">
        <h1 className="text-3xl font-bold mb-6">Market News</h1>
        <div className="max-w-4xl">
          <NewsSection />
        </div>
      </main>
    </div>
  );
};

export default NewsPage;
