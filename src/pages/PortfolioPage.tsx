import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Header } from "@/components/Dashboard/Header";
import { WalletCard } from "@/components/Dashboard/WalletCard";
import { Portfolio } from "@/components/Dashboard/Portfolio";
import { Loader2 } from "lucide-react";

const PortfolioPage = () => {
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
        <h1 className="text-3xl font-bold mb-6">My Portfolio</h1>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <Portfolio />
          </div>
          <div>
            <WalletCard />
          </div>
        </div>
      </main>
    </div>
  );
};

export default PortfolioPage;
