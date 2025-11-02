-- Create price_alerts table
CREATE TABLE IF NOT EXISTS public.price_alerts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  stock_symbol TEXT NOT NULL,
  target_price DECIMAL(10, 2) NOT NULL,
  condition TEXT NOT NULL CHECK (condition IN ('above', 'below')),
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  triggered_at TIMESTAMP WITH TIME ZONE
);

-- Enable Row Level Security
ALTER TABLE public.price_alerts ENABLE ROW LEVEL SECURITY;

-- Create policies for user access
CREATE POLICY "Users can view their own alerts" 
ON public.price_alerts 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own alerts" 
ON public.price_alerts 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own alerts" 
ON public.price_alerts 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own alerts" 
ON public.price_alerts 
FOR DELETE 
USING (auth.uid() = user_id);

-- Create index for faster queries
CREATE INDEX idx_price_alerts_user_id ON public.price_alerts(user_id);
CREATE INDEX idx_price_alerts_active ON public.price_alerts(is_active) WHERE is_active = true;