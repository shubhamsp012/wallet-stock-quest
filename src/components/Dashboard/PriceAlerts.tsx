import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Bell, Trash2, Plus } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export const PriceAlerts = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const [symbol, setSymbol] = useState("");
  const [targetPrice, setTargetPrice] = useState("");
  const [condition, setCondition] = useState<"above" | "below">("above");

  const { data: alerts } = useQuery({
    queryKey: ["price-alerts", user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      const { data, error } = await supabase
        .from("price_alerts")
        .select("*")
        .eq("user_id", user.id)
        .eq("is_active", true)
        .order("created_at", { ascending: false });
      
      if (error) throw error;
      return data;
    },
    enabled: !!user?.id,
  });

  const createAlert = useMutation({
    mutationFn: async () => {
      if (!user?.id) throw new Error("Not authenticated");
      const { error } = await supabase.from("price_alerts").insert({
        user_id: user.id,
        stock_symbol: symbol.toUpperCase(),
        target_price: parseFloat(targetPrice),
        condition,
        is_active: true,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["price-alerts"] });
      toast({ title: "Alert created successfully" });
      setOpen(false);
      setSymbol("");
      setTargetPrice("");
    },
    onError: () => {
      toast({ title: "Failed to create alert", variant: "destructive" });
    },
  });

  const deleteAlert = useMutation({
    mutationFn: async (alertId: string) => {
      const { error } = await supabase
        .from("price_alerts")
        .delete()
        .eq("id", alertId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["price-alerts"] });
      toast({ title: "Alert deleted" });
    },
  });

  return (
    <Card className="shadow-md hover:shadow-lg transition-shadow">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5 text-primary" />
            Price Alerts
          </CardTitle>
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button size="sm" className="gap-2">
                <Plus className="h-4 w-4" />
                Add Alert
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create Price Alert</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label>Stock Symbol</Label>
                  <Input
                    placeholder="e.g., AAPL"
                    value={symbol}
                    onChange={(e) => setSymbol(e.target.value)}
                    className="uppercase"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Condition</Label>
                  <Select value={condition} onValueChange={(v: "above" | "below") => setCondition(v)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="above">Price goes above</SelectItem>
                      <SelectItem value="below">Price goes below</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Target Price</Label>
                  <Input
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                    value={targetPrice}
                    onChange={(e) => setTargetPrice(e.target.value)}
                  />
                </div>
                <Button
                  className="w-full"
                  onClick={() => createAlert.mutate()}
                  disabled={!symbol || !targetPrice || createAlert.isPending}
                >
                  {createAlert.isPending ? "Creating..." : "Create Alert"}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent>
        {!alerts || alerts.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-6">
            No active alerts. Create one to get notified!
          </p>
        ) : (
          <div className="space-y-2">
            {alerts.map((alert) => (
              <div
                key={alert.id}
                className="flex items-center justify-between p-3 rounded-lg bg-accent/50 border border-border"
              >
                <div>
                  <div className="font-semibold text-sm">{alert.stock_symbol}</div>
                  <div className="text-xs text-muted-foreground">
                    {alert.condition === "above" ? "Above" : "Below"} $
                    {alert.target_price.toFixed(2)}
                  </div>
                </div>
                <Button
                  size="icon"
                  variant="ghost"
                  onClick={() => deleteAlert.mutate(alert.id)}
                  disabled={deleteAlert.isPending}
                >
                  <Trash2 className="h-4 w-4 text-destructive" />
                </Button>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
