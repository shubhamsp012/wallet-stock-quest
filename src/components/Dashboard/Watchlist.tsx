import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Star, TrendingUp, TrendingDown } from "lucide-react";
import { toast } from "sonner";
import { getMockStockData } from "@/services/mockStockData";
import { cn } from "@/lib/utils";

export const Watchlist = ({ onSelectStock }: { onSelectStock: (symbol: string) => void }) => {
  const { data: watchlist, isLoading, refetch } = useQuery({
    queryKey: ["watchlist"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { data, error } = await supabase
        .from("watchlist")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (error) throw error;

      // Get current prices from mock data
      return data.map((item) => {
        const stockData = getMockStockData(item.stock_symbol);
        return {
          ...item,
          currentPrice: stockData?.currentPrice || 0,
          change: stockData?.change || 0,
          changePercent: stockData?.changePercent || 0,
        };
      });
    },
    staleTime: 0,
    refetchInterval: 45000, // Refresh every 45 seconds
  });

  const removeFromWatchlist = async (id: string) => {
    try {
      await supabase.from("watchlist").delete().eq("id", id);
      toast.success("Removed from watchlist");
      refetch();
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Watchlist</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-16" />
          ))}
        </CardContent>
      </Card>
    );
  }

  if (!watchlist || watchlist.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Watchlist</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-center py-8">
            Your watchlist is empty. Add stocks to track them here.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Watchlist</CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        {watchlist.map((item) => {
          const isPositive = parseFloat(item.change) >= 0;

          return (
            <div
              key={item.id}
              className="p-3 rounded-lg border border-border hover:bg-accent/50 transition-colors cursor-pointer"
              onClick={() => onSelectStock(item.stock_symbol)}
            >
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold">{item.stock_symbol.replace(".BSE", "")}</h3>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6 text-yellow-500"
                      onClick={(e) => {
                        e.stopPropagation();
                        removeFromWatchlist(item.id);
                      }}
                    >
                      <Star className="h-3 w-3 fill-current" />
                    </Button>
                  </div>
                  <p className="text-xs text-muted-foreground">{item.stock_name}</p>
                </div>
                <div className="text-right">
                  <p className="font-semibold">₹{item.currentPrice.toFixed(2)}</p>
                  <div className={cn("flex items-center gap-1 justify-end text-xs", isPositive ? "text-profit" : "text-loss")}>
                    {isPositive ? (
                      <TrendingUp className="h-3 w-3" />
                    ) : (
                      <TrendingDown className="h-3 w-3" />
                    )}
                    <span>
                      {isPositive ? "+" : ""}{item.changePercent.toFixed(2)}%
                    </span>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
};
