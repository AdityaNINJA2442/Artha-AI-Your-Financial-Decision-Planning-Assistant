import datetime
import logging
from typing import Dict, Any, List
import httpx
from app.core.config import settings

logger = logging.getLogger("artha.market")

async def fetch_market_summary(is_demo_mode: bool = False) -> Dict[str, Any]:
    """
    Fetch market data from legitimate external market API or return explicit 'Market data unavailable' state.
    Strictly NO fake or random numbers in production mode.
    """
    current_time = datetime.datetime.now().strftime("%I:%M %p, %b %d, %Y")

    if is_demo_mode:
        # Explicitly labeled sample data for presentation demo account only
        return {
            "is_available": True,
            "is_demo_data": True,
            "status_label": "Demo Sample Market Data",
            "timestamp": current_time,
            "source": "Artha AI Demo Feed",
            "indices": [
                {"symbol": "^NSEI", "name": "NIFTY 50", "price": 25120.45, "change": 178.60, "percent_change": 0.72},
                {"symbol": "^BSESN", "name": "SENSEX", "price": 82350.10, "change": 520.15, "percent_change": 0.64},
                {"symbol": "GOLD", "name": "Gold (10g / 24K)", "price": 72450.00, "change": -120.00, "percent_change": -0.17},
                {"symbol": "SILVER", "name": "Silver (1kg)", "price": 86200.00, "change": 450.00, "percent_change": 0.53},
                {"symbol": "USDINR=X", "name": "USD / INR", "price": 83.92, "change": -0.05, "percent_change": -0.06}
            ]
        }

    # Production Check: Real Market Provider Integration
    if settings.MARKET_API_KEY and len(settings.MARKET_API_KEY.strip()) > 5:
        try:
            # Example Yahoo Finance / AlphaVantage / Indian Market API call
            async with httpx.AsyncClient(timeout=8.0) as client:
                res = await client.get(
                    f"https://query1.finance.yahoo.com/v7/finance/quote?symbols=^NSEI,^BSESN,USDINR=X",
                    headers={"User-Agent": "Mozilla/5.0"}
                )
                if res.status_code == 200:
                    data = res.json()
                    quotes = data.get("quoteResponse", {}).get("result", [])
                    indices = []
                    for q in quotes:
                        indices.append({
                            "symbol": q.get("symbol"),
                            "name": q.get("shortName", q.get("symbol")),
                            "price": q.get("regularMarketPrice", 0.0),
                            "change": q.get("regularMarketChange", 0.0),
                            "percent_change": q.get("regularMarketChangePercent", 0.0)
                        })
                    return {
                        "is_available": True,
                        "is_demo_data": False,
                        "status_label": "Live Market Data",
                        "timestamp": current_time,
                        "source": "Yahoo Finance API",
                        "indices": indices
                    }
        except Exception as e:
            logger.warning(f"Market API connection failed: {e}")

    # Explicitly Labeled Unavailable State (NO FAKE / RANDOM NUMBERS)
    return {
        "is_available": False,
        "is_demo_data": False,
        "status_label": "Market data temporarily unavailable",
        "timestamp": current_time,
        "source": "External Market Provider",
        "message": "Market data API is currently unconfigured or unavailable. Set MARKET_API_KEY in backend environment to enable live feed.",
        "indices": []
    }
