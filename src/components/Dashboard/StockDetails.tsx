import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowUpIcon, ArrowDownIcon, Star, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { useState } from "react";
import { TradeModal } from "./TradeModal";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

interface StockDetailsProps {
  symbol: string;
}

export const StockDetails = ({ symbol }: StockDetailsProps) => {
  const [tradeModalOpen, setTradeModalOpen] = useState(false);
  const [tradeType, setTradeType] = useState<"buy" | "sell">("buy");

  const { data: stockData, isLoading, error } = useQuery({
    queryKey: ["stock", symbol],
    queryFn: async () => {
      // Mock data for demonstration - in production, use real API
      await new Promise((resolve) => setTimeout(resolve, 500));
      
      const basePrice = Math.random() * 3000 + 500;
      const change = (Math.random() - 0.5) * 100;
      const changePercent = (change / basePrice) * 100;
      
      return {
        symbol: symbol.replace(".BSE", ""),
        name: symbol.replace(".BSE", "") + " Limited",
        price: basePrice.toFixed(2),
        change: change.toFixed(2),
        changePercent: changePercent.toFixed(2),
        high: (basePrice + Math.abs(change) * 1.5).toFixed(2),
        low: (basePrice - Math.abs(change) * 1.5).toFixed(2),
        previousClose: (basePrice - change).toFixed(2),
      };
    },
    refetchInterval: 5000, // Auto-refresh every 5 seconds
  });

  const { data: isWatchlisted, refetch: refetchWatchlist } = useQuery({
    queryKey: ["watchlist-status", symbol],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return false;

      const { data } = await supabase
        .from("watchlist")
        .select("id")
        .eq("user_id", user.id)
        .eq("stock_symbol", symbol)
        .maybeSingle();

      return !!data;
    },
  });

  const toggleWatchlist = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      if (isWatchlisted) {
        await supabase
          .from("watchlist")
          .delete()
          .eq("user_id", user.id)
          .eq("stock_symbol", symbol);
        toast.success("Removed from watchlist");
      } else {
        await supabase.from("watchlist").insert({
          user_id: user.id,
          stock_symbol: symbol,
          stock_name: stockData?.name || symbol,
        });
        toast.success("Added to watchlist");
      }
      refetchWatchlist();
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </CardContent>
      </Card>
    );
  }

  if (error || !stockData) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center h-64">
          <p className="text-muted-foreground">Failed to load stock data</p>
        </CardContent>
      </Card>
    );
  }

  const isPositive = parseFloat(stockData.change) >= 0;

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div>
              <CardTitle className="text-2xl">{stockData.symbol}</CardTitle>
              <p className="text-sm text-muted-foreground">{stockData.name}</p>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleWatchlist}
              className={cn(isWatchlisted && "text-yellow-500")}
            >
              <Star className={cn("h-5 w-5", isWatchlisted && "fill-current")} />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <div className="flex items-baseline gap-2">
              <span className="text-4xl font-bold">₹{stockData.price}</span>
              <div className={cn("flex items-center gap-1", isPositive ? "text-profit" : "text-loss")}>
                {isPositive ? (
                  <ArrowUpIcon className="h-4 w-4" />
                ) : (
                  <ArrowDownIcon className="h-4 w-4" />
                )}
                <span className="text-sm font-medium">
                  {stockData.change} ({stockData.changePercent}%)
                </span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-xs text-muted-foreground">High</p>
              <p className="font-semibold">₹{stockData.high}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Low</p>
              <p className="font-semibold">₹{stockData.low}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Prev. Close</p>
              <p className="font-semibold">₹{stockData.previousClose}</p>
            </div>
          </div>

          <div className="flex gap-2 pt-4">
            <Button
              className="flex-1"
              onClick={() => {
                setTradeType("buy");
                setTradeModalOpen(true);
              }}
            >
              Buy
            </Button>
            <Button
              variant="outline"
              className="flex-1"
              onClick={() => {
                setTradeType("sell");
                setTradeModalOpen(true);
              }}
            >
              Sell
            </Button>
          </div>
        </CardContent>
      </Card>

      <TradeModal
        open={tradeModalOpen}
        onOpenChange={setTradeModalOpen}
        stockSymbol={symbol}
        stockName={stockData.name}
        currentPrice={parseFloat(stockData.price)}
        tradeType={tradeType}
      />
    </>
  );
};
