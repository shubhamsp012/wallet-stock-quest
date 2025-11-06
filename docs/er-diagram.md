# Entity Relationship Diagram

This diagram shows the database structure and relationships in the Fingrow platform.

```mermaid
%%{init: {'theme':'base', 'themeVariables': {'primaryColor':'#fff','primaryTextColor':'#000','primaryBorderColor':'#000','lineColor':'#000','fontSize':'14px'}}}%%
erDiagram
    USER ||--|| PROFILE : has
    USER ||--o{ PORTFOLIO : owns
    USER ||--o{ TRANSACTION : makes
    USER ||--o{ WATCHLIST : maintains
    
    USER {
        uuid id PK
        string email
        timestamp created_at
    }
    
    PROFILE {
        uuid id PK
        uuid user_id FK
        decimal wallet_balance
        timestamp created_at
        timestamp updated_at
    }
    
    PORTFOLIO {
        uuid id PK
        uuid user_id FK
        string symbol
        integer quantity
        decimal average_buy_price
        timestamp created_at
    }
    
    TRANSACTION {
        uuid id PK
        uuid user_id FK
        string symbol
        string type
        integer quantity
        decimal price
        decimal total_amount
        timestamp created_at
    }
    
    WATCHLIST {
        uuid id PK
        uuid user_id FK
        string symbol
        timestamp created_at
    }
```

## Entity Descriptions

### USER
- Core authentication entity managed by the system
- Each user has a unique email address

### PROFILE
- Stores user's wallet balance and trading account information
- One-to-one relationship with USER
- Initial balance is ₹100,000

### PORTFOLIO
- Tracks all stock holdings for each user
- Stores quantity and average purchase price
- User can own multiple stocks

### TRANSACTION
- Records all buy and sell transactions
- Type can be 'buy' or 'sell'
- Maintains complete trading history

### WATCHLIST
- Allows users to monitor stocks without owning them
- Users can add multiple stocks to track
