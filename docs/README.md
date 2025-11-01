# Stock Trading Application - UML Diagrams

This directory contains comprehensive UML diagrams for the Stock Trading Application.

## 📊 Available Diagrams

### 1. [Use Case Diagram](./use-case-diagram.md)
Shows all the use cases and actors in the system, illustrating what users can do with the application.

**Key Use Cases:**
- User Authentication
- Stock Trading (Buy/Sell)
- Portfolio Management
- Watchlist Management
- Real-time Updates

### 2. [Sequence Diagrams](./sequence-diagrams.md)
Illustrates how objects interact over time for specific scenarios.

**Included Sequences:**
- User Authentication Flow
- Stock Purchase Flow
- Portfolio Real-time Update Flow
- Watchlist Management Flow
- Sell Stock Flow

### 3. [Activity Diagrams](./activity-diagrams.md)
Shows the flow of control from activity to activity.

**Included Activities:**
- Stock Trading Activity Flow
- Portfolio Value Calculation
- Real-time Data Update Activity

### 4. [State Diagrams](./state-diagrams.md)
Represents the states of objects and their transitions.

**Included State Machines:**
- Authentication State Machine
- Stock Trading State Machine
- Portfolio Update State Machine
- Watchlist State Machine
- Data Synchronization State Machine

### 5. [Class Diagram](./class-diagram.md)
Shows the structure of the system's components and their relationships.

**Key Components:**
- React Components
- Context Providers
- Data Models
- Service Classes
- Database Client

### 6. [Object Diagram](./object-diagram.md)
Shows specific instances of objects at a particular moment in time.

**Example Scenario:**
- User viewing portfolio with 3 active holdings
- Real-time price data
- Profit/Loss calculations
- Watchlist items
- Recent transactions

## 🎯 How to Use These Diagrams

### For Developers
- **Architecture Understanding**: Start with the Class Diagram to understand component structure
- **Feature Implementation**: Use Sequence Diagrams to understand interaction flows
- **State Management**: Refer to State Diagrams for component lifecycle
- **Business Logic**: Check Activity Diagrams for process flows

### For Project Managers
- **Feature Overview**: Use Case Diagram shows all system capabilities
- **User Flows**: Activity Diagrams illustrate user journeys
- **System Behavior**: Sequence Diagrams show how features work

### For Designers
- **User Interactions**: Activity and Sequence Diagrams show user flows
- **State Transitions**: State Diagrams help design UI state changes

## 🔄 Real-time Features

The application implements real-time updates every 45 seconds for:
- Stock prices in Portfolio
- Stock prices in Watchlist
- Stock prices in StockDetails
- Top Stocks display

## 💾 Database Schema

Key tables:
- **profiles**: User information and wallet balance
- **portfolio**: User's stock holdings
- **transactions**: Trade history
- **watchlist**: Stocks being monitored

## 🛠️ Technologies

- **Frontend**: React, TypeScript, Tailwind CSS
- **Backend**: Supabase (PostgreSQL)
- **State Management**: React Context, TanStack Query
- **UI Components**: shadcn/ui, Radix UI

## 📝 Diagram Syntax

All diagrams use Mermaid syntax for easy viewing in:
- GitHub
- GitLab
- VS Code (with Mermaid extension)
- Any Markdown viewer with Mermaid support

## 🔗 Quick Links

- [Project Repository](../)
- [Source Code](../src/)
- [Database Schema](../supabase/)
- [Component Library](../src/components/)

---

**Last Updated**: 2025
**Version**: 1.0
