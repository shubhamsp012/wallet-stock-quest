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

    // Sanitize input symbol
    const sanitized = String(symbol).trim().toUpperCase().replace(/['"]/g, '').replace(/\s+/g, '');
    
    // Convert Indian exchange suffixes to Alpha Vantage format
    // .NSE -> .NS (National Stock Exchange)
    // .BSE -> .BO (Bombay Stock Exchange)
    const alphaVantageSymbol = sanitized
      .replace(/\.NSE$/i, '.NS')
      .replace(/\.BSE$/i, '.BO');
    
    console.log('Sanitized symbol:', sanitized, '-> Alpha Vantage format:', alphaVantageSymbol);
    
    // Check cache
    const cacheKey = `${alphaVantageSymbol}_quote`;
    const cached = cache.get(cacheKey);
    const now = Date.now();
    if (cached && now - cached.timestamp < CACHE_TTL) {
      console.log('Returning cached data for:', alphaVantageSymbol);
      return new Response(JSON.stringify(cached.data), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    let currentPrice = NaN;
    let previousClose = NaN;
    let change = NaN;
    let changePercent = NaN;
    let high = NaN;
    let low = NaN;
    let dataSource = '';

    // Helper to check for rate limit
    const isRateLimited = (data: any) => data && data.Note && data.Note.includes('API call frequency');

    // Try intraday 5min first for fresh price
    try {
      const intradayUrl = `https://www.alphavantage.co/query?function=TIME_SERIES_INTRADAY&symbol=${alphaVantageSymbol}&interval=5min&outputsize=compact&apikey=${ALPHA_VANTAGE_API_KEY}`;
      console.log('Fetching intraday (5min) for:', alphaVantageSymbol);
      const intradayResponse = await fetch(intradayUrl);
      const intradayData = await intradayResponse.json();
      
      if (isRateLimited(intradayData)) {
        console.log('Rate limited on intraday, skipping...');
      } else {
        const intradaySeries = intradayData['Time Series (5min)'];
        if (intradaySeries) {
          const times = Object.keys(intradaySeries).sort().reverse();
          const latest = intradaySeries[times[0]];
          const prev = intradaySeries[times[1]];
          currentPrice = parseFloat(latest['4. close']);
          previousClose = prev ? parseFloat(prev['4. close']) : currentPrice;
          high = parseFloat(latest['2. high']);
          low = parseFloat(latest['3. low']);
          if (!Number.isNaN(currentPrice) && !Number.isNaN(previousClose)) {
            change = currentPrice - previousClose;
            changePercent = previousClose ? (change / previousClose) * 100 : 0;
            dataSource = 'intraday';
            console.log('Got valid price from intraday:', currentPrice);
          }
        }
      }
    } catch (e) {
      console.error('Intraday fetch failed:', e);
    }

    // If still missing, try daily adjusted
    if (Number.isNaN(currentPrice)) {
      try {
        const dailyUrl = `https://www.alphavantage.co/query?function=TIME_SERIES_DAILY_ADJUSTED&symbol=${alphaVantageSymbol}&apikey=${ALPHA_VANTAGE_API_KEY}`;
        console.log('Fetching daily adjusted for:', alphaVantageSymbol);
        const dailyResponse = await fetch(dailyUrl);
        const dailyData = await dailyResponse.json();
        
        if (isRateLimited(dailyData)) {
          console.log('Rate limited on daily, skipping...');
        } else {
          const dailySeries = dailyData['Time Series (Daily)'];
          if (dailySeries) {
            const dates = Object.keys(dailySeries).sort().reverse();
            const latest = dailySeries[dates[0]];
            const prev = dailySeries[dates[1]];
            currentPrice = parseFloat(latest['4. close']);
            previousClose = prev ? parseFloat(prev['4. close']) : currentPrice;
            high = parseFloat(latest['2. high']);
            low = parseFloat(latest['3. low']);
            if (!Number.isNaN(currentPrice) && !Number.isNaN(previousClose)) {
              change = currentPrice - previousClose;
              changePercent = previousClose ? (change / previousClose) * 100 : 0;
              dataSource = 'daily';
              console.log('Got valid price from daily:', currentPrice);
            }
          }
        }
      } catch (e) {
        console.error('Daily fetch failed:', e);
      }
    }

    // Last resort: try global quote
    if (Number.isNaN(currentPrice)) {
      try {
        const quoteUrl = `https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol=${alphaVantageSymbol}&apikey=${ALPHA_VANTAGE_API_KEY}`;
        console.log('Fetching global quote for:', alphaVantageSymbol);
        const quoteResponse = await fetch(quoteUrl);
        const quoteData = await quoteResponse.json();
        
        if (isRateLimited(quoteData)) {
          console.log('Rate limited on global quote, skipping...');
        } else {
          const quote = quoteData['Global Quote'];
          if (quote && quote['05. price']) {
            currentPrice = parseFloat(quote['05. price']);
            previousClose = quote['08. previous close'] ? parseFloat(quote['08. previous close']) : currentPrice;
            change = quote['09. change'] ? parseFloat(quote['09. change']) : 0;
            changePercent = quote['10. change percent'] ? parseFloat(quote['10. change percent'].replace('%', '')) : 0;
            high = quote['03. high'] ? parseFloat(quote['03. high']) : currentPrice;
            low = quote['04. low'] ? parseFloat(quote['04. low']) : currentPrice;
            dataSource = 'quote';
            console.log('Got valid price from global quote:', currentPrice);
          }
        }
      } catch (e) {
        console.error('Global quote fetch failed:', e);
      }
    }

    // Fetch historical data for the chart (only if not cached and we have data source)
    let historicalData = cached?.data?.historicalData || [];
    
    if (historicalData.length === 0 && dataSource) {
      try {
        const monthlyUrl = `https://www.alphavantage.co/query?function=TIME_SERIES_MONTHLY&symbol=${alphaVantageSymbol}&apikey=${ALPHA_VANTAGE_API_KEY}`;
        const monthlyResponse = await fetch(monthlyUrl);
        const monthlyData = await monthlyResponse.json();
        
        if (!isRateLimited(monthlyData)) {
          const monthlySeries = monthlyData['Monthly Time Series'];
          if (monthlySeries) {
            const months = Object.keys(monthlySeries).sort().slice(-5); // Get last 5 months
            for (const month of months) {
              const data = monthlySeries[month];
              historicalData.push({
                month: new Date(month).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
                value: parseFloat(data['4. close'])
              });
            }
          }
        }
      } catch (e) {
        console.error('Monthly fetch failed:', e);
      }
    }

    // If we couldn't get a valid price, serve last cached result as stale or return 503
    if (!currentPrice || currentPrice === 0 || Number.isNaN(currentPrice)) {
      if (cached) {
        const stale = { 
          ...cached.data, 
          stale: true, 
          lastUpdate: cached.data.lastUpdate || new Date().toISOString() 
        };
        console.log('Serving stale cached data for:', alphaVantageSymbol);
        return new Response(JSON.stringify(stale), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      } else {
        console.log('No valid price and no cache for:', alphaVantageSymbol);
        return new Response(
          JSON.stringify({ error: 'Data temporarily unavailable due to provider rate limits. Please retry shortly.' }),
          { status: 503, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
    }

    const result = {
      symbol: sanitized.replace(/\.(BSE|NSE|NS|BO)$/i, ''),
      name: sanitized.replace(/\.(BSE|NSE|NS|BO)$/i, '') + ' Limited',
      price: currentPrice.toFixed(2),
      change: change.toFixed(2),
      changePercent: changePercent.toFixed(2),
      high: high.toFixed(2),
      low: low.toFixed(2),
      previousClose: previousClose.toFixed(2),
      historicalData,
      lastUpdate: new Date().toISOString(),
      source: dataSource,
      stale: false
    };

    // Store in cache only if valid
    cache.set(cacheKey, {
      data: result,
      timestamp: now
    });

    console.log('Returning fresh data from source:', dataSource);
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
