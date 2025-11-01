# Object Diagram

This diagram shows specific instances of objects and their relationships at runtime.

## Scenario: User viewing portfolio with active holdings

```mermaid
graph TB
    subgraph "User Session"
        user1[":User<br/>id: abc123<br/>email: john@example.com"]
    end
    
    subgraph "Profile Object"
        profile1[":Profile<br/>id: p1<br/>userId: abc123<br/>walletBalance: 45000.00<br/>createdAt: 2024-01-01"]
    end
    
    subgraph "Portfolio Holdings"
        holding1[":PortfolioItem<br/>id: h1<br/>symbol: RELIANCE.BSE<br/>quantity: 10<br/>averageBuyPrice: 2800.00<br/>currentPrice: 2950.00<br/>totalValue: 29500.00<br/>profitLoss: +1500.00"]
        
        holding2[":PortfolioItem<br/>id: h2<br/>symbol: TCS.BSE<br/>quantity: 5<br/>averageBuyPrice: 3500.00<br/>currentPrice: 3400.00<br/>totalValue: 17000.00<br/>profitLoss: -500.00"]
        
        holding3[":PortfolioItem<br/>id: h3<br/>symbol: INFY.BSE<br/>quantity: 15<br/>averageBuyPrice: 1600.00<br/>currentPrice: 1750.00<br/>totalValue: 26250.00<br/>profitLoss: +2250.00"]
    end
    
    subgraph "Stock Data Objects"
        stock1[":StockData<br/>symbol: RELIANCE.BSE<br/>name: Reliance Industries<br/>currentPrice: 2950.00<br/>previousClose: 2900.00<br/>changePercent: +1.72%<br/>high: 2980.00<br/>low: 2890.00<br/>sector: Energy"]
        
        stock2[":StockData<br/>symbol: TCS.BSE<br/>name: Tata Consultancy<br/>currentPrice: 3400.00<br/>previousClose: 3450.00<br/>changePercent: -1.45%<br/>high: 3470.00<br/>low: 3380.00<br/>sector: IT"]
        
        stock3[":StockData<br/>symbol: INFY.BSE<br/>name: Infosys<br/>currentPrice: 1750.00<br/>previousClose: 1700.00<br/>changePercent: +2.94%<br/>high: 1765.00<br/>low: 1695.00<br/>sector: IT"]
    end
    
    subgraph "Watchlist"
        watch1[":WatchlistItem<br/>id: w1<br/>symbol: HDFCBANK.BSE<br/>addedAt: 2024-01-15"]
        
        watch2[":WatchlistItem<br/>id: w2<br/>symbol: ICICIBANK.BSE<br/>addedAt: 2024-01-16"]
    end
    
    subgraph "Recent Transaction"
        trans1[":Transaction<br/>id: t1<br/>symbol: INFY.BSE<br/>type: buy<br/>quantity: 5<br/>price: 1600.00<br/>totalAmount: 8000.00<br/>createdAt: 2024-01-20"]
        
        trans2[":Transaction<br/>id: t2<br/>symbol: RELIANCE.BSE<br/>type: buy<br/>quantity: 10<br/>price: 2800.00<br/>totalAmount: 28000.00<br/>createdAt: 2024-01-18"]
    end
    
    subgraph "Portfolio Summary"
        summary[":PortfolioSummary<br/>totalInvestment: 72000.00<br/>currentValue: 72750.00<br/>totalProfit: 3750.00<br/>totalLoss: 500.00<br/>netProfitLoss: +3250.00<br/>netProfitLossPercent: +4.51%"]
    end
    
    user1 --> profile1
    user1 --> holding1
    user1 --> holding2
    user1 --> holding3
    user1 --> watch1
    user1 --> watch2
    user1 --> trans1
    user1 --> trans2
    
    holding1 --> stock1
    holding2 --> stock2
    holding3 --> stock3
    
    holding1 --> summary
    holding2 --> summary
    holding3 --> summary
    
    trans1 --> holding3
    trans2 --> holding1
    
    style user1 fill:#4f46e5
    style profile1 fill:#10b981
    style summary fill:#f59e0b
    style holding1 fill:#22c55e
    style holding2 fill:#ef4444
    style holding3 fill:#22c55e
```

## Object Instance Details

### User Objects
- **user1**: Active user session for John
- **profile1**: User's profile with wallet balance of ₹45,000

### Portfolio Holdings
- **holding1**: Reliance Industries - 10 shares at profit of ₹1,500
- **holding2**: Tata Consultancy - 5 shares at loss of ₹500
- **holding3**: Infosys - 15 shares at profit of ₹2,250

### Stock Data
- **stock1**: Current market data for Reliance Industries
- **stock2**: Current market data for TCS
- **stock3**: Current market data for Infosys

### Watchlist
- **watch1**: HDFC Bank added to watchlist
- **watch2**: ICICI Bank added to watchlist

### Transactions
- **trans1**: Recent purchase of 5 Infosys shares
- **trans2**: Recent purchase of 10 Reliance shares

### Summary
- **summary**: Aggregated portfolio metrics showing overall performance
- Total investment: ₹72,000
- Current value: ₹72,750
- Net profit: ₹3,250 (+4.51%)

## Object Relationships

1. **User → Profile**: One-to-one relationship
2. **User → Portfolio Items**: One-to-many relationship
3. **Portfolio Items → Stock Data**: Many-to-one relationship (current prices)
4. **User → Watchlist**: One-to-many relationship
5. **User → Transactions**: One-to-many relationship
6. **Transactions → Portfolio Items**: Creates or updates holdings
7. **Portfolio Items → Summary**: Aggregates into summary statistics
