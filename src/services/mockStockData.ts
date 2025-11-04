// Mock stock data service - replaces API calls with realistic fake data

export interface StockData {
  symbol: string;
  name: string;
  currentPrice: number;
  change: number;
  changePercent: number;
  previousClose: number;
  high: number;
  low: number;
  volume: number;
  sector: string;
  historicalData: Array<{
    date: string;
    close: number;
  }>;
}

// Base stock definitions
const baseStocks = [
  { symbol: "TCS.NS", name: "Tata Consultancy Services", basePrice: 3800, sector: "IT" },
  { symbol: "RELIANCE.NS", name: "Reliance Industries", basePrice: 2450, sector: "Energy" },
  { symbol: "INFY.NS", name: "Infosys", basePrice: 1650, sector: "IT" },
  { symbol: "HDFCBANK.NS", name: "HDFC Bank", basePrice: 1580, sector: "Banking" },
  { symbol: "ICICIBANK.NS", name: "ICICI Bank", basePrice: 1150, sector: "Banking" },
  { symbol: "HINDUNILVR.NS", name: "Hindustan Unilever", basePrice: 2380, sector: "FMCG" },
  { symbol: "ITC.NS", name: "ITC Limited", basePrice: 465, sector: "FMCG" },
  { symbol: "SBIN.NS", name: "State Bank of India", basePrice: 780, sector: "Banking" },
  { symbol: "BHARTIARTL.NS", name: "Bharti Airtel", basePrice: 1550, sector: "Telecom" },
  { symbol: "WIPRO.NS", name: "Wipro", basePrice: 580, sector: "IT" },
  { symbol: "AXISBANK.NS", name: "Axis Bank", basePrice: 1125, sector: "Banking" },
  { symbol: "LT.NS", name: "Larsen & Toubro", basePrice: 3480, sector: "Infrastructure" },
  { symbol: "MARUTI.NS", name: "Maruti Suzuki", basePrice: 12500, sector: "Automotive" },
  { symbol: "ASIANPAINT.NS", name: "Asian Paints", basePrice: 2850, sector: "Paints" },
  { symbol: "HCLTECH.NS", name: "HCL Technologies", basePrice: 1820, sector: "IT" },
  { symbol: "BAJFINANCE.NS", name: "Bajaj Finance", basePrice: 7250, sector: "Finance" },
  { symbol: "TATAMOTORS.NS", name: "Tata Motors", basePrice: 780, sector: "Automotive" },
  { symbol: "TECHM.NS", name: "Tech Mahindra", basePrice: 1680, sector: "IT" },
  { symbol: "SUNPHARMA.NS", name: "Sun Pharma", basePrice: 1780, sector: "Pharma" },
  { symbol: "KOTAKBANK.NS", name: "Kotak Mahindra Bank", basePrice: 1880, sector: "Banking" },
];

// Get seeded random for consistent prices across 30-second windows
const getSeededRandom = (symbol: string, index: number) => {
  const timeWindow = Math.floor(Date.now() / 30000); // 30-second windows
  const seed = symbol.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) + timeWindow + index;
  const x = Math.sin(seed) * 10000;
  return x - Math.floor(x);
};

// Generate a random variance for price changes using seeded random
const getRandomVariance = (symbol: string, baseValue: number, index: number, maxPercent: number = 2) => {
  const random = getSeededRandom(symbol, index);
  const variance = (random - 0.5) * 2 * maxPercent / 100;
  return baseValue * (1 + variance);
};

// Generate historical data for past 12 months
const generateHistoricalData = (basePrice: number, months: number = 12) => {
  const data = [];
  const now = new Date();
  
  for (let i = months - 1; i >= 0; i--) {
    const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const monthName = date.toLocaleString('default', { month: 'short', year: 'numeric' });
    
    // Create realistic price trend with some volatility
    const trendFactor = 1 + (Math.random() - 0.45) * 0.15; // Slight upward bias
    const monthPrice = basePrice * trendFactor * (1 - i * 0.01); // Gradual increase over time
    
    data.push({
      date: monthName,
      close: Math.round(monthPrice * 100) / 100,
    });
  }
  
  return data;
};

// Get current stock data with random variations
export const getMockStockData = (symbol: string): StockData | null => {
  // Normalize symbol (remove exchange suffix if present)
  const cleanSymbol = symbol.toUpperCase().replace(/\.(NSE|BSE|NS|BO)$/, '');
  
  // Find stock by symbol (with or without .NS suffix)
  const stock = baseStocks.find(s => 
    s.symbol.includes(cleanSymbol) || s.symbol === symbol.toUpperCase()
  );
  
  if (!stock) return null;
  
  // Generate current price with seeded random variance for consistency
  const currentPrice = getRandomVariance(symbol, stock.basePrice, 0, 2);
  const previousClose = getRandomVariance(symbol, stock.basePrice, 1, 1.5);
  const change = currentPrice - previousClose;
  const changePercent = (change / previousClose) * 100;
  
  // Generate high/low for the day
  const high = Math.max(currentPrice, previousClose) * getRandomVariance(symbol, 1, 2, 0.5);
  const low = Math.min(currentPrice, previousClose) * getRandomVariance(symbol, 1, 3, -0.5);
  
  return {
    symbol: stock.symbol,
    name: stock.name,
    currentPrice: Math.round(currentPrice * 100) / 100,
    change: Math.round(change * 100) / 100,
    changePercent: Math.round(changePercent * 100) / 100,
    previousClose: Math.round(previousClose * 100) / 100,
    high: Math.round(high * 100) / 100,
    low: Math.round(low * 100) / 100,
    volume: Math.floor(Math.random() * 10000000) + 1000000,
    sector: stock.sector,
    historicalData: generateHistoricalData(stock.basePrice, 12),
  };
};

// Get multiple stocks data
export const getMockStocksData = (symbols: string[]): StockData[] => {
  return symbols
    .map(symbol => getMockStockData(symbol))
    .filter((data): data is StockData => data !== null);
};

// Get all available stocks
export const getAllMockStocks = (): StockData[] => {
  return baseStocks.map(stock => getMockStockData(stock.symbol)!);
};

// Search stocks by symbol or name
export const searchMockStocks = (query: string): StockData[] => {
  const searchTerm = query.toUpperCase();
  return baseStocks
    .filter(stock => 
      stock.symbol.includes(searchTerm) || 
      stock.name.toUpperCase().includes(searchTerm)
    )
    .map(stock => getMockStockData(stock.symbol)!)
    .slice(0, 10); // Limit to 10 results
};
