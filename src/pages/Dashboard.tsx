import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Header } from "@/components/Dashboard/Header";
import { WalletCard } from "@/components/Dashboard/WalletCard";
import { StockSearch } from "@/components/Dashboard/StockSearch";
import { StockDetails } from "@/components/Dashboard/StockDetails";
import { Watchlist } from "@/components/Dashboard/Watchlist";
import { TopStocks } from "@/components/Dashboard/TopStocks";
import { Loader2 } from "lucide-react";

const Dashboard = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [selectedStock, setSelectedStock] = useState<string | null>(null);

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
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <WalletCard />
            <TopStocks onSelectStock={setSelectedStock} />
            <StockSearch onSelectStock={setSelectedStock} />
            {selectedStock && <StockDetails symbol={selectedStock} />}
          </div>

          <div className="space-y-6">
            <Watchlist onSelectStock={setSelectedStock} />
          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
