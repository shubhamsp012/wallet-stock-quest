# Class Diagram

This diagram shows the component structure and relationships in the Fingrow platform.

```mermaid
%%{init: {'theme':'base', 'themeVariables': {'primaryColor':'#fff','primaryTextColor':'#000','primaryBorderColor':'#000','lineColor':'#000','fontSize':'14px'}}}%%
classDiagram
    class User {
        +string id
        +string email
        +login()
        +logout()
    }
    
    class Profile {
        +string userId
        +number walletBalance
        +updateBalance()
    }
    
    class Portfolio {
        +string symbol
        +number quantity
        +number avgBuyPrice
        +calculatePL()
    }
    
    class Transaction {
        +string type
        +string symbol
        +number quantity
        +number price
        +date createdAt
    }
    
    class Watchlist {
        +string symbol
        +addStock()
        +removeStock()
    }
    
    class StockData {
        +string symbol
        +string name
        +number price
        +number change
    }
    
    User "1" --> "1" Profile
    User "1" --> "*" Portfolio
    User "1" --> "*" Transaction
    User "1" --> "*" Watchlist
    Portfolio --> StockData
    Transaction --> StockData
    Watchlist --> StockData
```

## Component Dependencies

### Core Components
- **App**: Root component that provides contexts and routing
- **AuthContext**: Manages user authentication state
- **ThemeContext**: Manages light/dark theme
- **SupabaseClient**: Database and authentication client

### Page Components
- **Dashboard**: Main page with stock search and details
- **Portfolio**: Portfolio management page
- **Home**: Landing page with navigation cards
- **Auth**: Login/Register page
- **NewsPage**: Market news page

### Feature Components
- **Header**: Navigation bar with user menu
- **WalletCard**: Displays wallet balance
- **StockSearch**: Search functionality
- **StockDetails**: Detailed stock information
- **Portfolio**: Holdings list with P/L calculations
- **TradeModal**: Buy/Sell transaction interface
- **Watchlist**: Monitored stocks list
- **TopStocks**: Popular stocks display
- **NewsSection**: Latest market news

### Data Models
- **StockData**: Stock information structure
- **PortfolioItem**: User's stock holdings
- **Transaction**: Trade history record
- **WatchlistItem**: Watched stock reference
- **Profile**: User profile with wallet balance
