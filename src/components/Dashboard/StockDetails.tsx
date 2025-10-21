import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowUpIcon, ArrowDownIcon, Star, Loader2, RefreshCw, AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { cn } from "@/lib/utils";
import { useState } from "react";
import { TradeModal } from "./TradeModal";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface StockDetailsProps {
  symbol: string;
}

export const StockDetails = ({ symbol }: StockDetailsProps) => {
  const [tradeModalOpen, setTradeModalOpen] = useState(false);
  const [tradeType, setTradeType] = useState<"buy" | "sell">("buy");

  const { data: stockData, isLoading, error, refetch } = useQuery({
    queryKey: ["stock", symbol],
    queryFn: async () => {
      const { data, error } = await supabase.functions.invoke('fetch-stock-data', {
        body: { symbol }
      });

      if (error) throw error;
      return data;
    },
    refetchInterval: 60000, // Auto-refresh every minute
    retry: 2,
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

  if (error || (stockData && stockData.error)) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center h-64 gap-4">
          <AlertCircle className="h-12 w-12 text-muted-foreground" />
          <p className="text-muted-foreground text-center">
            Data temporarily unavailable due to provider rate limits.
          </p>
          <Button onClick={() => refetch()} variant="outline" size="sm">
            <RefreshCw className="h-4 w-4 mr-2" />
            Retry now
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (!stockData) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center h-64">
          <p className="text-muted-foreground">Failed to load stock data</p>
        </CardContent>
      </Card>
    );
  }

  const isPositive = parseFloat(stockData.change) >= 0;
  const price = parseFloat(stockData.price);
  const isStale = stockData.stale === true;
  const showPlaceholder = (val: string) => {
    const num = parseFloat(val);
    return (num === 0 || isNaN(num)) && !isStale;
  };

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <CardTitle className="text-2xl">{stockData.symbol}</CardTitle>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => refetch()}
                  className="h-8 w-8"
                  title="Refresh data"
                >
                  <RefreshCw className="h-4 w-4" />
                </Button>
              </div>
              <p className="text-sm text-muted-foreground">{stockData.name}</p>
              {stockData.lastUpdate && (
                <p className="text-xs text-muted-foreground mt-1">
                  Last updated: {new Date(stockData.lastUpdate).toLocaleTimeString()}
                </p>
              )}
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
          {isStale && (
            <Alert variant="default" className="bg-muted/50">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription className="text-sm">
                Live price temporarily unavailable. Showing last update.
              </AlertDescription>
            </Alert>
          )}

          <div>
            <div className="flex items-baseline gap-2">
              <span className="text-4xl font-bold">
                {showPlaceholder(stockData.price) ? '—' : `₹${stockData.price}`}
              </span>
              {!showPlaceholder(stockData.change) && (
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
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-xs text-muted-foreground">High</p>
              <p className="font-semibold">
                {showPlaceholder(stockData.high) ? '—' : `₹${stockData.high}`}
              </p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Low</p>
              <p className="font-semibold">
                {showPlaceholder(stockData.low) ? '—' : `₹${stockData.low}`}
              </p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Prev. Close</p>
              <p className="font-semibold">
                {showPlaceholder(stockData.previousClose) ? '—' : `₹${stockData.previousClose}`}
              </p>
            </div>
          </div>

          {stockData.historicalData && stockData.historicalData.length > 0 && (
            <div className="mt-6">
              <h3 className="text-sm font-semibold mb-3">5-Month Performance</h3>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={stockData.historicalData}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                    <XAxis dataKey="month" className="text-xs" />
                    <YAxis className="text-xs" />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: 'hsl(var(--card))', 
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '8px'
                      }}
                      formatter={(value: number) => [`₹${value.toFixed(2)}`, 'Price']}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="value" 
                      stroke="hsl(var(--primary))" 
                      strokeWidth={2}
                      dot={{ fill: 'hsl(var(--primary))' }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}

          <div className="flex gap-2 pt-4">
            <Button
              className="flex-1"
              onClick={() => {
                setTradeType("buy");
                setTradeModalOpen(true);
              }}
              disabled={price === 0 || isNaN(price)}
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
              disabled={price === 0 || isNaN(price)}
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
