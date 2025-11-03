import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Header } from "@/components/Dashboard/Header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2, TrendingUp, TrendingDown, Calendar } from "lucide-react";
import { format } from "date-fns";

const TransactionsPage = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && !user) {
      navigate("/auth");
    }
  }, [user, loading, navigate]);

  const { data: transactions, isLoading } = useQuery({
    queryKey: ["transactions", user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      const { data, error } = await supabase
        .from("transactions")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });
      
      if (error) throw error;
      return data;
    },
    enabled: !!user?.id,
  });

  if (loading || isLoading) {
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
            Transaction History
          </h1>
          <p className="text-muted-foreground">View all your stock trading transactions</p>
        </div>

        <Card className="shadow-lg animate-slide-up">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              All Transactions
            </CardTitle>
          </CardHeader>
          <CardContent>
            {!transactions || transactions.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                No transactions yet. Start trading to see your history here.
              </div>
            ) : (
              <div className="space-y-3">
                {transactions.map((transaction) => (
                  <div
                    key={transaction.id}
                    className="flex items-center justify-between p-4 rounded-lg border border-border hover:bg-accent/50 transition-all hover:shadow-md"
                  >
                    <div className="flex items-center gap-4">
                      <div
                        className={`p-2 rounded-full ${
                          transaction.transaction_type === "BUY"
                            ? "bg-success/10"
                            : "bg-destructive/10"
                        }`}
                      >
                        {transaction.transaction_type === "BUY" ? (
                          <TrendingUp className="h-5 w-5 text-success" />
                        ) : (
                          <TrendingDown className="h-5 w-5 text-destructive" />
                        )}
                      </div>
                  <div>
                    <div className="font-semibold text-foreground">
                      {transaction.stock_symbol}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {format(new Date(transaction.created_at), "MMM dd, yyyy 'at' HH:mm")}
                    </div>
                  </div>
                </div>

                <div className="text-right">
                  <Badge
                    variant={transaction.transaction_type === "BUY" ? "default" : "secondary"}
                    className="mb-2"
                  >
                    {transaction.transaction_type}
                  </Badge>
                  <div className="text-sm text-muted-foreground">
                    {transaction.quantity} shares @ ${transaction.price_per_share.toFixed(2)}
                  </div>
                  <div className="font-semibold text-foreground">
                    ${transaction.total_amount.toFixed(2)}
                  </div>
                </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default TransactionsPage;
