import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Wallet } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

export const WalletCard = () => {
  const { data: profile, isLoading } = useQuery({
    queryKey: ["profile"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();

      if (error) throw error;
      return data;
    },
  });

  if (isLoading) {
    return (
      <Card className="shadow-lg animate-pulse">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium">Wallet Balance</CardTitle>
          <Wallet className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-8 w-32" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="shadow-lg hover:shadow-glow transition-all border-primary/20 animate-fade-in">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium flex items-center gap-2">
          <div className="p-1.5 bg-gradient-primary rounded-lg shadow-glow">
            <Wallet className="h-4 w-4 text-white" />
          </div>
          <span className="bg-gradient-primary bg-clip-text text-transparent">Wallet Balance</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-3xl font-bold bg-gradient-primary bg-clip-text text-transparent">
          ₹{profile?.wallet_balance?.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
        </div>
        <p className="text-xs text-muted-foreground mt-1">Available for trading</p>
      </CardContent>
    </Card>
  );
};
