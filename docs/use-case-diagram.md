# Use Case Diagram

This diagram shows the various use cases and actors in the Fingrow platform.

```mermaid
graph TB
    subgraph "Fingrow - Stock Trading Platform"
        UC1[Login/Register]
        UC2[View Dashboard]
        UC3[Search Stocks]
        UC4[View Stock Details]
        UC5[Buy Stocks]
        UC6[Sell Stocks]
        UC7[View Portfolio]
        UC8[Add to Watchlist]
        UC9[Remove from Watchlist]
        UC10[View Wallet Balance]
        UC11[View Transaction History]
        UC12[View Market News]
        UC13[View Top Stocks]
        UC14[Track Profit/Loss]
        UC15[Real-time Price Updates]
    end
    
    User((User))
    System((System))
    
    User --> UC1
    User --> UC2
    User --> UC3
    User --> UC4
    User --> UC5
    User --> UC6
    User --> UC7
    User --> UC8
    User --> UC9
    User --> UC10
    User --> UC11
    User --> UC12
    User --> UC13
    User --> UC14
    
    UC15 --> System
    UC5 --> UC10
    UC6 --> UC10
    UC3 --> UC4
    UC4 --> UC5
    UC4 --> UC6
    UC4 --> UC8
    UC7 --> UC6
    UC7 --> UC14
    
    style User fill:#4f46e5
    style System fill:#10b981
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
