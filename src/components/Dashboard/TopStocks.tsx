import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { TrendingUp, TrendingDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { getMockStocksData } from "@/services/mockStockData";

interface TopStocksProps {
  onSelectStock: (symbol: string) => void;
}

export const TopStocks = ({ onSelectStock }: TopStocksProps) => {
  const topStockSymbols = ["TCS.NS", "RELIANCE.NS", "INFY.NS", "HDFCBANK.NS"];

  const { data: stocks, isLoading } = useQuery({
    queryKey: ["top-stocks"],
    queryFn: async () => {
      const stocksData = getMockStocksData(topStockSymbols);
      return stocksData.map(stock => ({
        symbol: stock.symbol.replace('.NS', ''),
        name: stock.name,
        price: stock.currentPrice.toFixed(2),
        change: stock.change.toFixed(2),
        changePercent: stock.changePercent.toFixed(2),
        previousClose: stock.previousClose.toFixed(2),
      }));
    },
    staleTime: 0,
    refetchInterval: 30000, // Refresh every 30 seconds
  });

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Top Stocks</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {[1, 2, 3, 4].map((i) => (
              <Skeleton key={i} className="h-24" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Top Stocks</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {stocks?.map((stock: any) => {
            const isPositive = parseFloat(stock.change) >= 0;
            return (
              <div
                key={stock.symbol}
                onClick={() => onSelectStock(`${stock.symbol}.NS`)}
                className="p-4 rounded-lg border border-border hover:bg-accent/50 transition-colors cursor-pointer"
              >
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <h3 className="font-semibold">{stock.symbol}</h3>
                    <p className="text-xs text-muted-foreground">{stock.name}</p>
                  </div>
                  <div className={cn("flex items-center gap-1", isPositive ? "text-profit" : "text-loss")}>
                    {isPositive ? (
                      <TrendingUp className="h-4 w-4" />
                    ) : (
                      <TrendingDown className="h-4 w-4" />
                    )}
                  </div>
                </div>

                <div className="flex items-baseline justify-between">
                  <span className="text-2xl font-bold">₹{stock.price}</span>
                  <span className={cn("text-sm font-medium", isPositive ? "text-profit" : "text-loss")}>
                    {isPositive ? "+" : ""}{stock.change} ({stock.changePercent}%)
                  </span>
                </div>

                <div className="mt-2 text-xs text-muted-foreground">
                  Prev. Close: ₹{stock.previousClose}
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};
