import { useAuth } from "@/contexts/AuthContext";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { TrendingUp, PieChart, DollarSign, Activity } from "lucide-react";
import { LineChart, Line, PieChart as RechartsPieChart, Pie, Cell, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { getMockStockData } from "@/services/mockStockData";

export const PortfolioAnalytics = () => {
  const { user } = useAuth();

  const { data: analytics, isLoading } = useQuery({
    queryKey: ["portfolio-analytics", user?.id],
    queryFn: async () => {
      if (!user?.id) return null;

      // Fetch portfolio
      const { data: portfolio, error } = await supabase
        .from("portfolio")
        .select("*")
        .eq("user_id", user.id);

      if (error) throw error;

      // Calculate analytics
      const portfolioWithPrices = portfolio.map((item) => {
        const stockData = getMockStockData(item.stock_symbol);
        const currentPrice = stockData?.currentPrice || item.average_buy_price;
        const currentValue = currentPrice * item.quantity;
        const totalCost = item.average_buy_price * item.quantity;
        const profitLoss = currentValue - totalCost;

        return {
          symbol: item.stock_symbol,
          value: currentValue,
          cost: totalCost,
          profitLoss,
          quantity: item.quantity,
        };
      });

      const totalValue = portfolioWithPrices.reduce((sum, item) => sum + item.value, 0);
      const totalCost = portfolioWithPrices.reduce((sum, item) => sum + item.cost, 0);
      const totalProfitLoss = totalValue - totalCost;
      const profitLossPercent = totalCost > 0 ? ((totalProfitLoss / totalCost) * 100) : 0;

      // Get top performers
      const topPerformers = [...portfolioWithPrices]
        .sort((a, b) => b.profitLoss - a.profitLoss)
        .slice(0, 3);

      return {
        totalValue,
        totalCost,
        totalProfitLoss,
        profitLossPercent,
        distribution: portfolioWithPrices,
        topPerformers,
      };
    },
    enabled: !!user?.id,
  });

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  if (!analytics) return null;

  const COLORS = ["hsl(221, 83%, 53%)", "hsl(142, 76%, 36%)", "hsl(0, 84%, 60%)", "hsl(45, 93%, 47%)", "hsl(280, 87%, 65%)"];

  return (
    <div className="space-y-4 animate-fade-in">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="shadow-md hover:shadow-glow transition-all">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <DollarSign className="h-4 w-4 text-primary" />
              Total Value
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${analytics.totalValue.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Cost: ${analytics.totalCost.toFixed(2)}
            </p>
          </CardContent>
        </Card>

        <Card className="shadow-md hover:shadow-glow transition-all">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-primary" />
              Total Return
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div
              className={`text-2xl font-bold ${
                analytics.totalProfitLoss >= 0 ? "text-profit" : "text-loss"
              }`}
            >
              ${Math.abs(analytics.totalProfitLoss).toFixed(2)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {analytics.profitLossPercent >= 0 ? "+" : ""}
              {analytics.profitLossPercent.toFixed(2)}%
            </p>
          </CardContent>
        </Card>

        <Card className="shadow-md hover:shadow-glow transition-all">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Activity className="h-4 w-4 text-primary" />
              Holdings
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.distribution.length}</div>
            <p className="text-xs text-muted-foreground mt-1">Active stocks</p>
          </CardContent>
        </Card>
      </div>

      {/* Distribution Chart */}
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <PieChart className="h-5 w-5 text-primary" />
            Portfolio Distribution
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <RechartsPieChart>
              <Pie
                data={analytics.distribution}
                dataKey="value"
                nameKey="symbol"
                cx="50%"
                cy="50%"
                outerRadius={100}
                label={(entry) => `${entry.symbol}: $${entry.value.toFixed(0)}`}
              >
                {analytics.distribution.map((_, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip
                formatter={(value: number) => `$${value.toFixed(2)}`}
                contentStyle={{
                  backgroundColor: "hsl(var(--card))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: "8px",
                }}
              />
            </RechartsPieChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Top Performers */}
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle>Top Performers</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {analytics.topPerformers.map((stock, index) => (
              <div
                key={stock.symbol}
                className="flex items-center justify-between p-3 rounded-lg bg-gradient-card border border-border"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center font-bold text-primary">
                    {index + 1}
                  </div>
                  <div>
                    <div className="font-semibold">{stock.symbol}</div>
                    <div className="text-xs text-muted-foreground">
                      {stock.quantity} shares
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div
                    className={`font-semibold ${
                      stock.profitLoss >= 0 ? "text-profit" : "text-loss"
                    }`}
                  >
                    {stock.profitLoss >= 0 ? "+" : ""}${stock.profitLoss.toFixed(2)}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {((stock.profitLoss / stock.cost) * 100).toFixed(2)}%
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
