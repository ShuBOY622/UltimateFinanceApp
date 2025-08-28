# Live Investment Tracking with Upstox API Integration

This document explains the comprehensive investment tracking functionality that allows manual portfolio entry combined with automatic live price fetching using the free Upstox API.

## Features Overview

### 📈 Manual Investment Entry
- Add stocks, mutual funds, ETFs, bonds, and other investment types manually
- Enter purchase details: symbol, quantity, purchase price, purchase date
- Support for multiple platforms (Groww, Zerodha, Upstox, etc.)
- Sector categorization and personal notes

### 🔄 Live Price Fetching
- Automatic price updates using free Upstox API
- Real-time return calculations based on live vs purchase prices
- Scheduled updates every 5 minutes during market hours
- Manual price refresh for individual investments
- Fallback to manual pricing when API is unavailable

### 📊 Advanced Analytics
- Beautiful animated charts and visualizations
- Portfolio distribution by type and sector
- Performance tracking with gain/loss calculations
- Top performers and underperformers analysis

## Setup Instructions

### 1. Upstox API Configuration

To enable live price fetching, you need to configure the Upstox API:

1. **Get Upstox API Access**:
   - Visit [Upstox Developer Portal](https://upstox.com/developer/)
   - Sign up for a free API account
   - Get your access token

2. **Configure Application**:
   ```yaml
   # In application.yml
   upstox:
     access:
       token: YOUR_UPSTOX_ACCESS_TOKEN_HERE
   ```

3. **Without API Token**:
   - The system works perfectly with manual entry only
   - Live price updates will be disabled
   - All calculations use manually entered current prices

### 2. Database Migration

The system automatically creates the required database tables with the new price tracking fields:

```sql
-- New fields added to investments table
ALTER TABLE investments ADD COLUMN last_price_update DATETIME;
ALTER TABLE investments ADD COLUMN price_source VARCHAR(50);
ALTER TABLE investments ADD COLUMN live_price_enabled BOOLEAN DEFAULT true;
ALTER TABLE investments ADD COLUMN last_price_error VARCHAR(100);
```

## How It Works

### 📝 Manual Entry Process

1. **Add Investment**:
   - Click the "+" button to open the investment form
   - Enter stock symbol (e.g., RELIANCE, TCS, HDFCBANK)
   - Fill in company name, investment type, and sector
   - Enter quantity and purchase price
   - Select purchase date
   - Add platform and notes (optional)
   - **Current price is fetched automatically** - no manual entry needed!

2. **Smart Price Fetching**:
   - System automatically detects if Upstox API is configured
   - For supported symbols, current market price is fetched immediately
   - Purchase price can be auto-populated if not provided
   - Shows clear status indicators for price source (UPSTOX/MANUAL/FALLBACK)

3. **Popular Stock Suggestions**:
   - System provides suggestions for popular Indian stocks
   - All suggested stocks are supported by Upstox API
   - Click any suggestion to auto-fill the form

### 🔄 Live Price Updates

1. **Automatic Updates**:
   - Scheduled every 5 minutes during market hours (9:15 AM - 3:30 PM IST)
   - Updates all investments with live price enabled
   - Skips updates when market is closed (configurable)

2. **Manual Updates**:
   - Click "Update Prices" button for all investments
   - Click refresh icon on individual investment cards
   - Real-time status updates with success/error messages

3. **Price Source Tracking**:
   - **UPSTOX**: Live price from Upstox API
   - **MANUAL**: User-entered price
   - **FALLBACK**: Using purchase price when API fails

### 🎛️ Live Price Controls

1. **Enable/Disable Live Updates**:
   - Toggle switch on each investment card
   - Disabled investments won't be updated automatically
   - Useful for manual price management

2. **Price Status Indicators**:
   - Green chip: Live price from Upstox
   - Gray chip: Manual price entry
   - Orange chip: Fallback price (API failed)

3. **Error Handling**:
   - Warning alerts for price fetch failures
   - Last update timestamp display
   - Graceful fallback to previous prices

## Supported Investment Types

### Stocks
- **Supported**: All NSE stocks with Upstox instrument keys
- **Popular**: RELIANCE, TCS, HDFCBANK, INFY, ICICIBANK, etc.
- **Live Updates**: ✅ Full support

### Mutual Funds
- **Entry**: Manual entry with fund details
- **Tracking**: Amount invested and returns calculation
- **Live Updates**: 🔄 Planned (NAV updates)

### Others
- ETFs, Bonds, Gold, Real Estate, Crypto
- Manual entry and tracking
- Live updates: Symbol-dependent

## API Integration Details

### Upstox LTP (Last Traded Price) API
- **Endpoint**: `https://api.upstox.com/v2/market-quote/ltp`
- **Rate Limits**: Standard free tier limits
- **Batch Support**: Up to 500 instruments per request
- **Market Hours**: Live updates during trading hours only

### Price Update Workflow
1. **Batch Processing**: Group investments by symbol
2. **API Call**: Fetch prices for all unique symbols
3. **Update Database**: Save prices with timestamps
4. **Error Handling**: Log failures, continue with other investments
5. **Frontend Refresh**: Real-time UI updates

## Configuration Options

### Application Settings
```yaml
# Investment Configuration
investment:
  price-update:
    enabled: true                    # Enable/disable price updates
    interval: 300000                # Update interval (5 minutes)
    market-hours-only: true         # Only update during market hours

# Upstox Configuration  
upstox:
  api:
    base-url: https://api.upstox.com/v2
  access:
    token: # Your access token here
```

### Market Hours Configuration
- **Default**: 9:15 AM - 3:30 PM IST, Monday-Friday
- **Customizable**: Modify `UpstoxIntegrationService.isMarketOpen()`
- **Holiday Support**: Can be enhanced with market calendar API

## Frontend Features

### 🎨 Beautiful UI Components
- **Animated Cards**: Hover effects and smooth transitions
- **Status Indicators**: Color-coded price source chips
- **Real-time Updates**: Live status without page refresh
- **Responsive Design**: Works on desktop and mobile

### 📊 Advanced Charts
- **Portfolio Distribution**: Pie charts by type and sector
- **Performance Graphs**: Bar charts for top/bottom performers
- **Trend Analysis**: Historical performance tracking
- **Interactive Elements**: Hover details and clickable legends

### 🔔 User Notifications
- **Success Messages**: Price updates, investment actions
- **Error Alerts**: API failures, validation errors
- **Status Updates**: Market open/closed, API availability
- **Progress Indicators**: Loading states and update progress

## Usage Examples

### Adding a Stock Investment
```javascript
// Example: Adding Reliance stock
{
  symbol: "RELIANCE",
  name: "Reliance Industries Ltd",
  type: "STOCK",
  quantity: 100,
  purchasePrice: 2500.00,
  purchaseDate: "2024-01-15",
  platform: "Groww",
  sector: "Energy",
  notes: "Long-term holding"
}
```

### Live Price Update Response
```javascript
{
  id: 1,
  symbol: "RELIANCE",
  currentPrice: 2650.50,
  lastPriceUpdate: "2024-01-20T14:30:00",
  priceSource: "UPSTOX",
  livePriceEnabled: true,
  lastPriceError: null,
  gainLoss: 15050.00,
  gainLossPercentage: 6.02
}
```

## API Endpoints

### Investment Management
```
GET    /api/investments                 # Get all investments
POST   /api/investments                 # Create investment
PUT    /api/investments/{id}            # Update investment
DELETE /api/investments/{id}            # Delete investment
```

### Live Price Operations
```
POST   /api/investments/trigger-price-update        # Manual price update
GET    /api/investments/api-status                  # API availability status
GET    /api/investments/price-update-status         # Update service status
POST   /api/investments/{id}/toggle-live-price      # Enable/disable live price
POST   /api/investments/{id}/refresh-price          # Refresh single price
```

### Analytics
```
GET    /api/investments/portfolio/summary           # Portfolio overview
GET    /api/investments/portfolio/distribution      # Distribution analysis
GET    /api/investments/portfolio/performance       # Performance metrics
```

## Troubleshooting

### Common Issues

1. **500 Internal Server Error - "Failed to load investments"**:
   - This usually means the database table is missing the new price tracking columns
   - **Solution**: Run the updated SQL script:
   ```sql
   USE financeDb;
   
   ALTER TABLE investments 
   ADD COLUMN IF NOT EXISTS last_price_update DATETIME NULL,
   ADD COLUMN IF NOT EXISTS price_source VARCHAR(50) NULL,
   ADD COLUMN IF NOT EXISTS live_price_enabled BOOLEAN DEFAULT true,
   ADD COLUMN IF NOT EXISTS last_price_error VARCHAR(100) NULL;
   
   UPDATE investments 
   SET price_source = 'MANUAL', live_price_enabled = true 
   WHERE price_source IS NULL;
   ```
   - Restart your Spring Boot application after running the SQL

2. **Live Prices Not Updating**:
   - Check Upstox API token configuration
   - Verify market hours (updates only during trading)
   - Check network connectivity

3. **Symbol Not Supported**:
   - Use supported NSE symbols only
   - Check symbol format (e.g., "RELIANCE" not "RELIANCE.NS")
   - Refer to supported symbols list

4. **API Rate Limits**:
   - Free tier has request limits
   - System automatically handles batch requests
   - Consider upgrading for high-frequency updates

### Error Messages
- **"Live price unavailable"**: Symbol not supported or API error
- **"Price update failed"**: Network or API service issue
- **"Market is closed"**: Updates paused outside trading hours

## Future Enhancements

### Planned Features
- 📊 **Mutual Fund NAV Updates**: Live NAV fetching for mutual funds
- 📈 **Historical Charts**: Price history and trend analysis
- 🔔 **Price Alerts**: Notifications for target prices
- 📱 **Mobile App**: React Native mobile application
- 🤖 **AI Insights**: ML-based investment recommendations

### API Integrations
- **Alpha Vantage**: Backup price source
- **Yahoo Finance**: Additional market data
- **NSE/BSE APIs**: Direct exchange integration
- **Mutual Fund APIs**: AMC-specific NAV updates

## Support

For any issues or questions:
1. Check the application logs for detailed error messages
2. Verify API configuration and network connectivity
3. Review the supported symbols list
4. Contact support with specific error details

---

**Note**: This system is designed for personal investment tracking. Always verify prices and calculations independently before making investment decisions.