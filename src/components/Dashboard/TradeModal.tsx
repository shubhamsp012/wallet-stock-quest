import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

interface TradeModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  stockSymbol: string;
  stockName: string;
  currentPrice: number;
  tradeType: "buy" | "sell";
}

export const TradeModal = ({
  open,
  onOpenChange,
  stockSymbol,
  stockName,
  currentPrice,
  tradeType,
}: TradeModalProps) => {
  const [quantity, setQuantity] = useState(1);
  const queryClient = useQueryClient();

  const { data: profile } = useQuery({
    queryKey: ["profile"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { data } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();

      return data;
    },
    enabled: open,
  });

  const { data: portfolio } = useQuery({
    queryKey: ["portfolio-item", stockSymbol],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { data } = await supabase
        .from("portfolio")
        .select("*")
        .eq("user_id", user.id)
        .eq("stock_symbol", stockSymbol)
        .maybeSingle();

      return data;
    },
    enabled: open && tradeType === "sell",
  });

  const tradeMutation = useMutation({
    mutationFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const totalAmount = currentPrice * quantity;

      if (tradeType === "buy") {
        if (!profile || profile.wallet_balance < totalAmount) {
          throw new Error("Insufficient balance");
        }

        // Update wallet
        await supabase
          .from("profiles")
          .update({ wallet_balance: profile.wallet_balance - totalAmount })
          .eq("id", user.id);

        // Update portfolio
        if (portfolio) {
          const newQuantity = portfolio.quantity + quantity;
          const newAvgPrice = 
            (portfolio.average_buy_price * portfolio.quantity + totalAmount) / newQuantity;
          
          await supabase
            .from("portfolio")
            .update({
              quantity: newQuantity,
              average_buy_price: newAvgPrice,
            })
            .eq("id", portfolio.id);
        } else {
          await supabase.from("portfolio").insert({
            user_id: user.id,
            stock_symbol: stockSymbol,
            stock_name: stockName,
            quantity,
            average_buy_price: currentPrice,
          });
        }

        // Record transaction
        await supabase.from("transactions").insert({
          user_id: user.id,
          stock_symbol: stockSymbol,
          stock_name: stockName,
          transaction_type: "buy",
          quantity,
          price_per_share: currentPrice,
          total_amount: totalAmount,
        });
      } else {
        // Sell logic
        if (!portfolio || portfolio.quantity < quantity) {
          throw new Error("Insufficient shares");
        }

        // Update wallet
        await supabase
          .from("profiles")
          .update({ wallet_balance: (profile?.wallet_balance || 0) + totalAmount })
          .eq("id", user.id);

        // Update portfolio
        const newQuantity = portfolio.quantity - quantity;
        if (newQuantity === 0) {
          await supabase.from("portfolio").delete().eq("id", portfolio.id);
        } else {
          await supabase
            .from("portfolio")
            .update({ quantity: newQuantity })
            .eq("id", portfolio.id);
        }

        // Record transaction
        await supabase.from("transactions").insert({
          user_id: user.id,
          stock_symbol: stockSymbol,
          stock_name: stockName,
          transaction_type: "sell",
          quantity,
          price_per_share: currentPrice,
          total_amount: totalAmount,
        });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["profile"] });
      queryClient.invalidateQueries({ queryKey: ["portfolio"] });
      queryClient.invalidateQueries({ queryKey: ["transactions"] });
      toast.success(
        `✅ You ${tradeType === "buy" ? "bought" : "sold"} ${quantity} shares of ${stockName}`
      );
      onOpenChange(false);
      setQuantity(1);
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });

  const totalCost = currentPrice * quantity;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {tradeType === "buy" ? "Buy" : "Sell"} {stockName}
          </DialogTitle>
          <DialogDescription>
            Current price: ₹{currentPrice.toFixed(2)}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="quantity">Quantity</Label>
            <Input
              id="quantity"
              type="number"
              min="1"
              max={tradeType === "sell" ? portfolio?.quantity : undefined}
              value={quantity}
              onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
            />
            {tradeType === "sell" && portfolio && (
              <p className="text-xs text-muted-foreground">
                Available: {portfolio.quantity} shares
              </p>
            )}
          </div>

          <div className="rounded-lg bg-muted p-4 space-y-2">
            <div className="flex justify-between text-sm">
              <span>Total Cost:</span>
              <span className="font-semibold">₹{totalCost.toFixed(2)}</span>
            </div>
            {profile && (
              <div className="flex justify-between text-sm">
                <span>Wallet Balance:</span>
                <span className="font-semibold">₹{profile.wallet_balance.toFixed(2)}</span>
              </div>
            )}
            {tradeType === "buy" && profile && (
              <div className="flex justify-between text-sm">
                <span>Balance After:</span>
                <span className="font-semibold">
                  ₹{(profile.wallet_balance - totalCost).toFixed(2)}
                </span>
              </div>
            )}
          </div>

          <Button
            className="w-full"
            onClick={() => tradeMutation.mutate()}
            disabled={tradeMutation.isPending}
          >
            {tradeMutation.isPending
              ? "Processing..."
              : `${tradeType === "buy" ? "Buy" : "Sell"} ${quantity} ${quantity === 1 ? "Share" : "Shares"}`}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
