import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const ALPHA_VANTAGE_API_KEY = Deno.env.get('ALPHA_VANTAGE_API_KEY');

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Simple in-memory cache (5 minutes TTL)
const cache = new Map<string, { data: any; timestamp: number }>();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { symbol } = await req.json();
    
    if (!symbol) {
      throw new Error('Symbol is required');
    }

    console.log('Fetching data for symbol:', symbol);

    // Convert Indian exchange suffixes to Alpha Vantage format
    // NSE (National Stock Exchange) -> .NS
    // BSE (Bombay Stock Exchange) -> .BO
    let alphaVantageSymbol = symbol;
    if (symbol.endsWith('.NSE')) {
      alphaVantageSymbol = symbol.replace('.NSE', '.NS');
    } else if (symbol.endsWith('.BSE')) {
      alphaVantageSymbol = symbol.replace('.BSE', '.BO');
    }
    
    console.log('Alpha Vantage symbol format:', alphaVantageSymbol);
    
    // Check cache
    const cacheKey = `${alphaVantageSymbol}_quote`;
    const cached = cache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
      console.log('Returning cached data for:', alphaVantageSymbol);
      return new Response(JSON.stringify(cached.data), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Fetch real-time quote
    const quoteUrl = `https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol=${alphaVantageSymbol}&apikey=${ALPHA_VANTAGE_API_KEY}`;
    console.log('Fetching quote from Alpha Vantage for:', alphaVantageSymbol);
    
    const quoteResponse = await fetch(quoteUrl);
    const quoteData = await quoteResponse.json();

    if (quoteData['Error Message'] || quoteData['Note']) {
      console.error('Alpha Vantage error:', quoteData);
      throw new Error(quoteData['Error Message'] || 'API rate limit reached. Please wait a moment.');
    }

    const quote = quoteData['Global Quote'];
    // Proceed with fallbacks if quote is missing


    // Fetch monthly historical data
    const monthlyUrl = `https://www.alphavantage.co/query?function=TIME_SERIES_MONTHLY&symbol=${alphaVantageSymbol}&apikey=${ALPHA_VANTAGE_API_KEY}`;
    console.log('Fetching monthly data from Alpha Vantage for:', alphaVantageSymbol);
    
    const monthlyResponse = await fetch(monthlyUrl);
    const monthlyData = await monthlyResponse.json();

    let historicalData: Array<{ month: string; value: number }> = [];
    if (monthlyData['Monthly Time Series']) {
      const timeSeries = monthlyData['Monthly Time Series'];
      const dates = Object.keys(timeSeries).slice(0, 6).reverse(); // Last 6 months
      
      historicalData = dates.map(date => ({
        month: new Date(date).toLocaleDateString('en-US', { month: 'short' }),
        value: parseFloat(timeSeries[date]['4. close'])
      }));
    }

    let currentPrice = quote && quote['05. price'] ? parseFloat(quote['05. price']) : NaN;
    let change = quote && quote['09. change'] ? parseFloat(quote['09. change']) : NaN;
    let changePercent = quote && quote['10. change percent'] ? parseFloat(String(quote['10. change percent']).replace('%', '')) : NaN;
    let previousClose = quote && quote['08. previous close'] ? parseFloat(quote['08. previous close']) : NaN;
    let high = quote && quote['03. high'] ? parseFloat(quote['03. high']) : NaN;
    let low = quote && quote['04. low'] ? parseFloat(quote['04. low']) : NaN;

    if (Number.isNaN(currentPrice)) {
      try {
        const dailyUrl = `https://www.alphavantage.co/query?function=TIME_SERIES_DAILY_ADJUSTED&symbol=${alphaVantageSymbol}&apikey=${ALPHA_VANTAGE_API_KEY}`;
        console.log('Falling back to daily data for:', alphaVantageSymbol);
        const dailyResponse = await fetch(dailyUrl);
        const dailyData = await dailyResponse.json();
        const series = dailyData['Time Series (Daily)'];
        if (series) {
          const days = Object.keys(series).sort().reverse();
          const latest = series[days[0]];
          const prev = series[days[1]];
          currentPrice = parseFloat(latest['4. close']);
          previousClose = prev ? parseFloat(prev['4. close']) : previousClose;
          high = parseFloat(latest['2. high']);
          low = parseFloat(latest['3. low']);
          if (!Number.isNaN(currentPrice) && !Number.isNaN(previousClose)) {
            change = currentPrice - previousClose;
            changePercent = previousClose ? (change / previousClose) * 100 : changePercent;
          }
        }
      } catch (e) {
        console.error('Daily fallback failed:', e);
      }
    }

    // Final fallback to monthly latest close if still missing
    if (Number.isNaN(currentPrice) && monthlyData && monthlyData['Monthly Time Series']) {
      const mSeries = monthlyData['Monthly Time Series'];
      const mDates = Object.keys(mSeries).sort().reverse();
      const mLatest = mSeries[mDates[0]];
      if (mLatest) {
        currentPrice = parseFloat(mLatest['4. close']);
        previousClose = currentPrice;
        change = 0;
        changePercent = 0;
      }
    }

    // Normalize any NaN values to 0 to avoid runtime issues
    currentPrice = Number.isFinite(currentPrice) ? currentPrice : 0;
    previousClose = Number.isFinite(previousClose) ? previousClose : 0;
    change = Number.isFinite(change) ? change : 0;
    changePercent = Number.isFinite(changePercent) ? changePercent : 0;
    high = Number.isFinite(high) ? high : 0;
    low = Number.isFinite(low) ? low : 0;

    const result = {
      symbol: symbol.replace(/\.(BSE|NSE)$/, ''),
      name: symbol.replace(/\.(BSE|NSE)$/, '') + ' Limited',
      price: currentPrice.toFixed(2),
      change: change.toFixed(2),
      changePercent: changePercent.toFixed(2),
      high: high.toFixed(2),
      low: low.toFixed(2),
      previousClose: previousClose.toFixed(2),
      historicalData,
      lastUpdate: new Date().toISOString(),
    };

    // Cache the result
    cache.set(cacheKey, { data: result, timestamp: Date.now() });
    console.log('Successfully fetched and cached data for:', alphaVantageSymbol);

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error: any) {
    console.error('Error in fetch-stock-data function:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
