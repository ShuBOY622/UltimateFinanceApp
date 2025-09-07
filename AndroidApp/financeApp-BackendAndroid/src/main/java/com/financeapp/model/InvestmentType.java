package com.financeapp.model;

public enum InvestmentType {
    STOCK("Stock"),
    MUTUAL_FUND("Mutual Fund"),
    ETF("ETF"),
    BOND("Bond"),
    CRYPTO("Cryptocurrency"),
    GOLD("Gold"),
    REAL_ESTATE("Real Estate"),
    OTHER("Other");

    private final String displayName;

    InvestmentType(String displayName) {
        this.displayName = displayName;
    }

    public String getDisplayName() {
        return displayName;
    }

    @Override
    public String toString() {
        return displayName;
    }
}