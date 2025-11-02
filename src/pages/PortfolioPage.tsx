import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Header } from "@/components/Dashboard/Header";
import { WalletCard } from "@/components/Dashboard/WalletCard";
import { Portfolio } from "@/components/Dashboard/Portfolio";
import { PriceAlerts } from "@/components/Dashboard/PriceAlerts";
import { PortfolioAnalytics } from "@/components/Dashboard/PortfolioAnalytics";
import { Loader2 } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

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
        <div className="mb-6 animate-fade-in">
          <h1 className="text-3xl font-bold mb-2 bg-gradient-primary bg-clip-text text-transparent">
            My Portfolio
          </h1>
          <p className="text-muted-foreground">Manage your investments and track performance</p>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <WalletCard />
            
            <Tabs defaultValue="holdings" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="holdings">Holdings</TabsTrigger>
                <TabsTrigger value="analytics">Analytics</TabsTrigger>
              </TabsList>
              <TabsContent value="holdings" className="mt-6">
                <Portfolio />
              </TabsContent>
              <TabsContent value="analytics" className="mt-6">
                <PortfolioAnalytics />
              </TabsContent>
            </Tabs>
          </div>
          
          <div className="space-y-6">
            <PriceAlerts />
          </div>
        </div>
      </main>
    </div>
  );
};

export default PortfolioPage;
