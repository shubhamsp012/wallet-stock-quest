import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { TrendingUp, TrendingDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { getMockStockData } from "@/services/mockStockData";
import { useState } from "react";
import { TradeModal } from "./TradeModal";

export const Portfolio = () => {
  const [tradeModalOpen, setTradeModalOpen] = useState(false);
  const [selectedStock, setSelectedStock] = useState<{
    symbol: string;
    name: string;
    price: number;
  } | null>(null);

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

      // Fetch current prices from mock data
      const portfolioWithPrices = data.map((item) => {
        const stockData = getMockStockData(item.stock_symbol);
        return {
          ...item,
          currentPrice: stockData?.currentPrice || parseFloat(item.average_buy_price),
        };
      });

      return portfolioWithPrices;
    },
    staleTime: 0,
    refetchInterval: 45000, // Refresh every 45 seconds
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

  // Calculate totals
  const totals = portfolio.reduce(
    (acc, item) => {
      const totalValue = item.currentPrice * item.quantity;
      const totalCost = parseFloat(item.average_buy_price) * item.quantity;
      const profitLoss = totalValue - totalCost;
      
      if (profitLoss >= 0) {
        acc.totalProfit += profitLoss;
      } else {
        acc.totalLoss += Math.abs(profitLoss);
      }
      acc.totalInvestment += totalCost;
      acc.totalCurrentValue += totalValue;
      
      return acc;
    },
    { totalProfit: 0, totalLoss: 0, totalInvestment: 0, totalCurrentValue: 0 }
  );

  const netProfitLoss = totals.totalProfit - totals.totalLoss;
  const netProfitLossPercent = totals.totalInvestment > 0 
    ? (netProfitLoss / totals.totalInvestment) * 100 
    : 0;

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

              <div className="grid grid-cols-4 gap-2 text-sm">
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
                <div>
                  <p className="text-xs text-muted-foreground">P/L per share</p>
                  <p className={cn("font-medium", isProfit ? "text-profit" : "text-loss")}>
                    {isProfit ? "+" : ""}₹{((item.currentPrice - parseFloat(item.average_buy_price))).toFixed(2)}
                  </p>
                </div>
              </div>

              <div className="mt-2 pt-2 border-t border-border flex justify-between items-center text-sm">
                <div>
                  <span className="text-muted-foreground">Total Value</span>
                  <span className="font-semibold ml-2">₹{totalValue.toFixed(2)}</span>
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedStock({
                      symbol: item.stock_symbol,
                      name: item.stock_name,
                      price: item.currentPrice,
                    });
                    setTradeModalOpen(true);
                  }}
                >
                  Sell
                </Button>
              </div>
            </div>
          );
        })}

        {/* Summary Section */}
        <div className="mt-6 pt-4 border-t-2 border-border space-y-3">
          <h3 className="font-semibold text-lg mb-3">Portfolio Summary</h3>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="p-3 rounded-lg bg-profit/10 border border-profit/20">
              <p className="text-xs text-muted-foreground mb-1">Total Profit</p>
              <p className="text-xl font-bold text-profit">
                +₹{totals.totalProfit.toFixed(2)}
              </p>
            </div>
            
            <div className="p-3 rounded-lg bg-loss/10 border border-loss/20">
              <p className="text-xs text-muted-foreground mb-1">Total Loss</p>
              <p className="text-xl font-bold text-loss">
                -₹{totals.totalLoss.toFixed(2)}
              </p>
            </div>
          </div>

          <div className="p-4 rounded-lg bg-accent/50 border border-border">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-muted-foreground">Total Investment</span>
              <span className="font-semibold">₹{totals.totalInvestment.toFixed(2)}</span>
            </div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-muted-foreground">Current Value</span>
              <span className="font-semibold">₹{totals.totalCurrentValue.toFixed(2)}</span>
            </div>
            <div className="flex items-center justify-between pt-2 border-t border-border">
              <span className="font-semibold">Net P/L</span>
              <div className="text-right">
                <p className={cn("text-lg font-bold", netProfitLoss >= 0 ? "text-profit" : "text-loss")}>
                  {netProfitLoss >= 0 ? "+" : ""}₹{netProfitLoss.toFixed(2)}
                </p>
                <p className={cn("text-sm", netProfitLoss >= 0 ? "text-profit" : "text-loss")}>
                  ({netProfitLoss >= 0 ? "+" : ""}{netProfitLossPercent.toFixed(2)}%)
                </p>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
      {selectedStock && (
        <TradeModal
          open={tradeModalOpen}
          onOpenChange={setTradeModalOpen}
          stockSymbol={selectedStock.symbol}
          stockName={selectedStock.name}
          currentPrice={selectedStock.price}
          tradeType="sell"
        />
      )}
    </Card>
  );
};
