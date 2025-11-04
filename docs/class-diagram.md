# Class Diagram

This diagram shows the component structure and relationships in the Fingrow platform.

```mermaid
classDiagram
    class App {
        +Router
        +AuthProvider
        +ThemeProvider
        +QueryClientProvider
    }
    
    class AuthContext {
        -User user
        -Session session
        -boolean loading
        +signOut()
        +useAuth()
    }
    
    class ThemeContext {
        -Theme theme
        +toggleTheme()
        +useTheme()
    }
    
    class Dashboard {
        -string selectedStock
        +setSelectedStock()
        +render()
    }
    
    class Portfolio {
        -PortfolioItem[] portfolio
        -boolean loading
        +calculateTotals()
        +handleSell()
        +render()
    }
    
    class WalletCard {
        -number balance
        -boolean loading
        +fetchBalance()
        +render()
    }
    
    class StockSearch {
        -string searchQuery
        -boolean searching
        +handleSearch()
        +render()
    }
    
    class StockDetails {
        -string symbol
        -StockData stockData
        -boolean inWatchlist
        +fetchStockData()
        +addToWatchlist()
        +removeFromWatchlist()
        +handleBuy()
        +handleSell()
        +render()
    }
    
    class TradeModal {
        -string symbol
        -string type
        -number quantity
        -number totalPrice
        +validateTrade()
        +executeTrade()
        +render()
    }
    
    class Watchlist {
        -WatchlistItem[] watchlist
        -boolean loading
        +fetchWatchlist()
        +removeFromWatchlist()
        +render()
    }
    
    class TopStocks {
        -StockData[] topStocks
        +fetchTopStocks()
        +render()
    }
    
    class NewsSection {
        -NewsItem[] news
        +fetchNews()
        +render()
    }
    
    class Header {
        -User user
        +navigate()
        +toggleTheme()
        +signOut()
        +render()
    }
    
    class SupabaseClient {
        -string url
        -string anonKey
        +auth
        +from()
        +rpc()
    }
    
    class MockStockData {
        +getMockStockData(symbol)
        +getAllMockStocks()
        +searchMockStocks(query)
        +generateHistoricalData()
    }
    
    class StockData {
        +string symbol
        +string name
        +number currentPrice
        +number previousClose
        +number changePercent
        +HistoricalData[] historicalData
        +number high
        +number low
        +number volume
        +string sector
    }
    
    class PortfolioItem {
        +string id
        +string userId
        +string symbol
        +number quantity
        +string averageBuyPrice
        +string createdAt
    }
    
    class Transaction {
        +string id
        +string userId
        +string symbol
        +string type
        +number quantity
        +string price
        +string totalAmount
        +string createdAt
    }
    
    class WatchlistItem {
        +string id
        +string userId
        +string symbol
        +string createdAt
    }
    
    class Profile {
        +string id
        +string userId
        +string walletBalance
        +string createdAt
        +string updatedAt
    }
    
    %% Relationships
    App --> AuthContext : provides
    App --> ThemeContext : provides
    App --> Dashboard : routes to
    
    Dashboard --> Header : uses
    Dashboard --> WalletCard : uses
    Dashboard --> StockSearch : uses
    Dashboard --> StockDetails : uses
    Dashboard --> Watchlist : uses
    Dashboard --> TopStocks : uses
    
    Portfolio --> Header : uses
    Portfolio --> WalletCard : uses
    Portfolio --> TradeModal : uses
    
    StockDetails --> TradeModal : uses
    StockDetails --> MockStockData : fetches from
    
    Portfolio --> SupabaseClient : queries
    WalletCard --> SupabaseClient : queries
    Watchlist --> SupabaseClient : queries
    TradeModal --> SupabaseClient : mutates
    
    StockDetails --> StockData : displays
    TopStocks --> StockData : displays
    Portfolio --> PortfolioItem : displays
    Watchlist --> WatchlistItem : displays
    
    TradeModal --> Transaction : creates
    TradeModal --> PortfolioItem : updates
    TradeModal --> Profile : updates
    
    AuthContext --> SupabaseClient : uses
    
    MockStockData --> StockData : returns
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
