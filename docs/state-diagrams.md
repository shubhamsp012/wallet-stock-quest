# State Diagrams

## 1. Authentication State Diagram

```mermaid
stateDiagram-v2
    [*] --> Unauthenticated
    
    Unauthenticated --> Loading: User visits app
    Loading --> Unauthenticated: No session found
    Loading --> Authenticated: Valid session
    
    Unauthenticated --> AuthPage: Redirect to /auth
    AuthPage --> Registering: Click Sign Up
    AuthPage --> LoggingIn: Click Sign In
    
    Registering --> CreatingProfile: Supabase auth success
    CreatingProfile --> Authenticated: Profile created with ₹100k wallet
    CreatingProfile --> Error: Profile creation failed
    
    LoggingIn --> Authenticated: Credentials valid
    LoggingIn --> Error: Invalid credentials
    
    Error --> AuthPage: Show error message
    
    Authenticated --> Dashboard: Redirect to dashboard
    Dashboard --> Authenticated: Using app
    
    Authenticated --> LoggingOut: Click Sign Out
    LoggingOut --> Unauthenticated: Session cleared
    
    Unauthenticated --> [*]
```

## 2. Stock Trading State Diagram

```mermaid
stateDiagram-v2
    [*] --> Idle
    
    Idle --> Searching: User searches stock
    Searching --> DisplayingResults: Results found
    Searching --> Idle: No results / Cancel
    
    DisplayingResults --> StockSelected: User selects stock
    DisplayingResults --> Idle: Clear search
    
    StockSelected --> ViewingDetails: Fetch stock data
    ViewingDetails --> StockSelected: Data loaded
    
    ViewingDetails --> BuyModalOpen: Click Buy
    ViewingDetails --> SellModalOpen: Click Sell
    ViewingDetails --> AddingToWatchlist: Click Add to Watchlist
    ViewingDetails --> Idle: Close details
    
    BuyModalOpen --> ValidatingBuy: User enters quantity
    ValidatingBuy --> InsufficientFunds: Balance too low
    ValidatingBuy --> ConfirmingBuy: Validation passed
    
    InsufficientFunds --> BuyModalOpen: Show error
    
    ConfirmingBuy --> ProcessingBuy: User confirms
    ProcessingBuy --> BuySuccess: Transaction complete
    ProcessingBuy --> BuyError: Transaction failed
    
    BuySuccess --> RefreshingData: Update portfolio
    BuyError --> BuyModalOpen: Show error
    
    SellModalOpen --> ValidatingSell: User enters quantity
    ValidatingSell --> InsufficientShares: Not enough shares
    ValidatingSell --> ConfirmingSell: Validation passed
    
    InsufficientShares --> SellModalOpen: Show error
    
    ConfirmingSell --> ProcessingSell: User confirms
    ProcessingSell --> SellSuccess: Transaction complete
    ProcessingSell --> SellError: Transaction failed
    
    SellSuccess --> RefreshingData: Update portfolio
    SellError --> SellModalOpen: Show error
    
    AddingToWatchlist --> WatchlistAdded: Save to database
    AddingToWatchlist --> AlreadyInWatchlist: Already exists
    WatchlistAdded --> ViewingDetails: Success message
    AlreadyInWatchlist --> ViewingDetails: Info message
    
    RefreshingData --> Idle: Data refreshed
    BuyModalOpen --> ViewingDetails: Cancel
    SellModalOpen --> ViewingDetails: Cancel
    
    Idle --> [*]
```

## 3. Portfolio Update State Diagram

```mermaid
stateDiagram-v2
    [*] --> Initial
    
    Initial --> LoadingPortfolio: Component mounts
    LoadingPortfolio --> Empty: No holdings found
    LoadingPortfolio --> Loaded: Holdings found
    LoadingPortfolio --> Error: Fetch failed
    
    Empty --> Loaded: User buys first stock
    
    Loaded --> Calculating: Calculate P/L values
    Calculating --> Displaying: All calculations done
    
    Displaying --> WaitingForUpdate: Display complete
    WaitingForUpdate --> FetchingPrices: 30s timer expires
    
    FetchingPrices --> UpdatingPrices: New prices received
    UpdatingPrices --> Calculating: Prices updated
    
    Displaying --> SellInitiated: User clicks Sell
    SellInitiated --> ProcessingSell: Confirm sale
    ProcessingSell --> Loaded: Transaction complete
    ProcessingSell --> Error: Transaction failed
    
    Error --> LoadingPortfolio: Retry
    
    Loaded --> [*]: Component unmounts
```

## 4. Watchlist State Diagram

```mermaid
stateDiagram-v2
    [*] --> Initial
    
    Initial --> LoadingWatchlist: Component mounts
    LoadingWatchlist --> Empty: No stocks in watchlist
    LoadingWatchlist --> PopulatedWatchlist: Stocks found
    LoadingWatchlist --> Error: Fetch failed
    
    Empty --> PopulatedWatchlist: Stock added
    
    PopulatedWatchlist --> RefreshingPrices: 30s interval
    RefreshingPrices --> PopulatedWatchlist: Prices updated
    
    PopulatedWatchlist --> StockClicked: User clicks stock
    StockClicked --> ViewingStockDetails: Navigate to details
    
    PopulatedWatchlist --> RemovingStock: User clicks remove
    RemovingStock --> PopulatedWatchlist: Stock removed (still has stocks)
    RemovingStock --> Empty: Last stock removed
    RemovingStock --> Error: Removal failed
    
    ViewingStockDetails --> PopulatedWatchlist: Return to watchlist
    
    Error --> LoadingWatchlist: Retry
    
    PopulatedWatchlist --> [*]: Component unmounts
    Empty --> [*]: Component unmounts
```

## 5. Data Synchronization State Diagram

```mermaid
stateDiagram-v2
    [*] --> Synchronized
    
    Synchronized --> OutOfSync: User action triggers change
    
    OutOfSync --> UpdatingLocal: Optimistic UI update
    UpdatingLocal --> SendingToServer: Update local state
    
    SendingToServer --> WaitingForResponse: API call in progress
    
    WaitingForResponse --> Synchronized: Success response
    WaitingForResponse --> Conflict: Conflict detected
    WaitingForResponse --> Failed: Network/Server error
    
    Failed --> Retrying: Retry mechanism
    Retrying --> SendingToServer: Retry attempt
    Retrying --> OutOfSync: Max retries exceeded
    
    Conflict --> ResolvingConflict: Fetch latest data
    ResolvingConflict --> Synchronized: Conflict resolved
    
    Synchronized --> RefetchingData: 30s interval / Manual refresh
    RefetchingData --> Synchronized: Data updated
    
    Synchronized --> [*]
```
