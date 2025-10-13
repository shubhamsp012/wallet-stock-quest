import { useState } from "react";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export const StockSearch = ({ onSelectStock }: { onSelectStock: (symbol: string) => void }) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [searching, setSearching] = useState(false);

  // Popular Indian stocks for quick access
  const popularStocks = [
    { symbol: "RELIANCE.BSE", name: "Reliance Industries" },
    { symbol: "TCS.BSE", name: "Tata Consultancy Services" },
    { symbol: "INFY.BSE", name: "Infosys" },
    { symbol: "HDFCBANK.BSE", name: "HDFC Bank" },
    { symbol: "ITC.BSE", name: "ITC Limited" },
  ];

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) {
      toast.error("Please enter a stock symbol");
      return;
    }
    setSearching(true);
    // Add .BSE suffix if not present
    const symbol = searchQuery.toUpperCase().includes(".BSE") 
      ? searchQuery.toUpperCase() 
      : `${searchQuery.toUpperCase()}.BSE`;
    onSelectStock(symbol);
    setSearching(false);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Search Stocks</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <form onSubmit={handleSearch} className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Enter stock symbol (e.g., TCS, INFY)"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>
          <Button type="submit" disabled={searching}>
            Search
          </Button>
        </form>

        <div>
          <p className="text-sm text-muted-foreground mb-2">Popular Stocks:</p>
          <div className="flex flex-wrap gap-2">
            {popularStocks.map((stock) => (
              <Button
                key={stock.symbol}
                variant="outline"
                size="sm"
                onClick={() => onSelectStock(stock.symbol)}
                className="text-xs"
              >
                {stock.name}
              </Button>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
