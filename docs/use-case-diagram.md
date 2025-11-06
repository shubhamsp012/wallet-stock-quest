# Use Case Diagram

This diagram shows the various use cases and actors in the Fingrow platform.

```mermaid
%%{init: {'theme':'base', 'themeVariables': {'primaryColor':'#fff','primaryTextColor':'#000','primaryBorderColor':'#000','lineColor':'#000','secondaryColor':'#fff','tertiaryColor':'#fff','background':'#fff','fontSize':'16px'}}}%%
graph TB
    User((User))
    
    UC1[Login/Register]
    UC2[Search Stocks]
    UC3[View Stock Details]
    UC4[Buy/Sell Stocks]
    UC5[View Portfolio]
    UC6[Manage Watchlist]
    UC7[View Transactions]
    UC8[Check Wallet]
    
    User --> UC1
    User --> UC2
    User --> UC3
    User --> UC4
    User --> UC5
    User --> UC6
    User --> UC7
    User --> UC8
    
    UC2 --> UC3
    UC3 --> UC4
    UC3 --> UC6
    UC4 --> UC8
```

## Use Case Descriptions

### User Use Cases
- **UC1: Login/Register** - User authenticates or creates new account
- **UC2: View Dashboard** - User views main dashboard with overview
- **UC3: Search Stocks** - User searches for stocks by symbol or name
- **UC4: View Stock Details** - User views detailed information about a stock
- **UC5: Buy Stocks** - User purchases shares of a stock
- **UC6: Sell Stocks** - User sells shares from portfolio
- **UC7: View Portfolio** - User views their stock holdings
- **UC8: Add to Watchlist** - User adds stock to watchlist for monitoring
- **UC9: Remove from Watchlist** - User removes stock from watchlist
- **UC10: View Wallet Balance** - User checks available funds
- **UC11: View Transaction History** - User reviews past transactions
- **UC12: View Market News** - User reads latest market news
- **UC13: View Top Stocks** - User sees top performing stocks
- **UC14: Track Profit/Loss** - User monitors gains and losses

### System Use Cases
- **UC15: Real-time Price Updates** - System automatically updates stock prices every 30 seconds
