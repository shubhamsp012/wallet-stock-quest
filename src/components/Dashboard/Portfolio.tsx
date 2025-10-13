import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { TrendingUp, TrendingDown } from "lucide-react";
import { cn } from "@/lib/utils";

export const Portfolio = () => {
  const { data: portfolio, isLoading } = useQuery({
    queryKey: ["portfolio"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { data, error } = await supabase
        .from("portfolio")
        .select("*")
        .eq("user_id", user.id);

      if (error) throw error;

      // Mock current prices for demo
      return data.map((item) => ({
        ...item,
        currentPrice: parseFloat(item.average_buy_price) * (0.9 + Math.random() * 0.2),
      }));
    },
  });

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Portfolio</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-20" />
          ))}
        </CardContent>
      </Card>
    );
  }

  if (!portfolio || portfolio.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Portfolio</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-center py-8">
            Your portfolio is empty. Start trading to see your investments here.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Portfolio</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {portfolio.map((item) => {
          const totalValue = item.currentPrice * item.quantity;
          const totalCost = parseFloat(item.average_buy_price) * item.quantity;
          const profitLoss = totalValue - totalCost;
          const profitLossPercent = (profitLoss / totalCost) * 100;
          const isProfit = profitLoss >= 0;

          return (
            <div
              key={item.id}
              className="p-4 rounded-lg border border-border hover:bg-accent/50 transition-colors"
            >
              <div className="flex items-center justify-between mb-2">
                <div>
                  <h3 className="font-semibold">{item.stock_symbol.replace(".BSE", "")}</h3>
                  <p className="text-xs text-muted-foreground">{item.stock_name}</p>
                </div>
                <div className={cn("flex items-center gap-1", isProfit ? "text-profit" : "text-loss")}>
                  {isProfit ? (
                    <TrendingUp className="h-4 w-4" />
                  ) : (
                    <TrendingDown className="h-4 w-4" />
                  )}
                  <span className="text-sm font-medium">
                    {isProfit ? "+" : ""}₹{profitLoss.toFixed(2)}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2 text-sm">
                <div>
                  <p className="text-xs text-muted-foreground">Qty</p>
                  <p className="font-medium">{item.quantity}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Avg Price</p>
                  <p className="font-medium">₹{parseFloat(item.average_buy_price).toFixed(2)}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Current</p>
                  <p className="font-medium">₹{item.currentPrice.toFixed(2)}</p>
                </div>
              </div>

              <div className="mt-2 pt-2 border-t border-border flex justify-between text-sm">
                <span className="text-muted-foreground">Total Value</span>
                <span className="font-semibold">₹{totalValue.toFixed(2)}</span>
              </div>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
};
