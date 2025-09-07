package com.financeapp.service;

import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.client.RestClientException;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.*;
import java.util.regex.Matcher;
import java.util.regex.Pattern;
import java.util.stream.Collectors;

@Service
public class MutualFundService {

    private final RestTemplate restTemplate = new RestTemplate();
    private static final String AMFI_NAV_URL = "https://www.amfiindia.com/spages/NAVAll.txt";

    // Cache for NAV data to avoid frequent API calls
    private Map<String, MutualFundData> navCache = new HashMap<>();
    private Map<String, BigDecimal> previousNavCache = new HashMap<>(); // Store previous day's NAV
    private LocalDateTime lastCacheUpdate = null;
    private static final long CACHE_DURATION_MINUTES = 30; // Cache for 30 minutes

    public static class MutualFundData {
        private String schemeCode;
        private String isin;
        private String schemeName;
        private BigDecimal nav;
        private LocalDateTime date;

        public MutualFundData(String schemeCode, String isin, String schemeName, BigDecimal nav, LocalDateTime date) {
            this.schemeCode = schemeCode;
            this.isin = isin;
            this.schemeName = schemeName;
            this.nav = nav;
            this.date = date;
        }

        // Getters
        public String getSchemeCode() { return schemeCode; }
        public String getIsin() { return isin; }
        public String getSchemeName() { return schemeName; }
        public BigDecimal getNav() { return nav; }
        public LocalDateTime getDate() { return date; }
    }

    /**
     * Fetch NAV data from AMFI and update cache
     */
    private void updateNavCache() {
        try {
            String navData = restTemplate.getForObject(AMFI_NAV_URL, String.class);
            if (navData != null) {
                parseAndCacheNavData(navData);
                lastCacheUpdate = LocalDateTime.now();
            }
        } catch (RestClientException e) {
            System.err.println("Error fetching NAV data from AMFI: " + e.getMessage());
            throw new RuntimeException("Failed to fetch NAV data from AMFI", e);
        }
    }

    /**
     * Parse AMFI NAV data and cache it
     */
    private void parseAndCacheNavData(String navData) {
        // Store current NAVs as previous NAVs before updating
        Map<String, BigDecimal> newPreviousNavs = new HashMap<>();
        for (Map.Entry<String, MutualFundData> entry : navCache.entrySet()) {
            if (entry.getValue() != null) {
                newPreviousNavs.put(entry.getKey(), entry.getValue().getNav());
            }
        }
        previousNavCache = newPreviousNavs;

        navCache.clear();
        String[] lines = navData.split("\n");

        // Pattern to match NAV data lines: Scheme Code;ISIN;ISIN2;Scheme Name;NAV;Date
        Pattern pattern = Pattern.compile("^([^;]+);([^;]*);([^;]*);([^;]+);([\\d.]+);(.+)$");

        for (String line : lines) {
            line = line.trim();
            if (line.isEmpty() || line.startsWith(";") || !line.contains(";")) {
                continue; // Skip empty lines, headers, or invalid lines
            }

            Matcher matcher = pattern.matcher(line);
            if (matcher.matches()) {
                try {
                    String schemeCode = matcher.group(1).trim();
                    String isin = matcher.group(2).trim();
                    String schemeName = matcher.group(4).trim();
                    String navStr = matcher.group(5).trim();
                    String dateStr = matcher.group(6).trim();

                    BigDecimal nav = new BigDecimal(navStr);
                    LocalDateTime date = parseAmfiDate(dateStr);

                    // Use scheme code as primary key, also store by ISIN if available
                    MutualFundData mfData = new MutualFundData(schemeCode, isin, schemeName, nav, date);
                    navCache.put(schemeCode, mfData);

                    // Also store by ISIN if available
                    if (!isin.isEmpty()) {
                        navCache.put(isin, mfData);
                    }

                    // Store by scheme name (normalized) for search
                    String normalizedName = normalizeSchemeName(schemeName);
                    navCache.put(normalizedName, mfData);

                } catch (Exception e) {
                    System.err.println("Error parsing NAV line: " + line + " - " + e.getMessage());
                }
            }
        }

        System.out.println("Cached " + navCache.size() + " mutual fund NAV entries");
    }

    /**
     * Parse AMFI date format (e.g., "05-Sep-2025")
     */
    private LocalDateTime parseAmfiDate(String dateStr) {
        try {
            // Convert "05-Sep-2025" to LocalDateTime
            String[] parts = dateStr.split("-");
            if (parts.length == 3) {
                int day = Integer.parseInt(parts[0]);
                int month = getMonthNumber(parts[1]);
                int year = Integer.parseInt(parts[2]);

                return LocalDateTime.of(year, month, day, 0, 0);
            }
        } catch (Exception e) {
            System.err.println("Error parsing date: " + dateStr);
        }
        return LocalDateTime.now();
    }

    /**
     * Convert month name to number
     */
    private int getMonthNumber(String monthName) {
        switch (monthName) {
            case "Jan": return 1;
            case "Feb": return 2;
            case "Mar": return 3;
            case "Apr": return 4;
            case "May": return 5;
            case "Jun": return 6;
            case "Jul": return 7;
            case "Aug": return 8;
            case "Sep": return 9;
            case "Oct": return 10;
            case "Nov": return 11;
            case "Dec": return 12;
            default: return 1;
        }
    }

    /**
     * Normalize scheme name for search
     */
    private String normalizeSchemeName(String name) {
        return name.toLowerCase()
                   .replaceAll("[^a-zA-Z0-9\\s]", "")
                   .replaceAll("\\s+", " ")
                   .trim();
    }

    /**
     * Get current NAV for a mutual fund by scheme code, ISIN, or name
     */
    public BigDecimal getCurrentNav(String identifier) {
        // Check if cache needs update
        if (lastCacheUpdate == null ||
            lastCacheUpdate.plusMinutes(CACHE_DURATION_MINUTES).isBefore(LocalDateTime.now())) {
            updateNavCache();
        }

        MutualFundData data = navCache.get(identifier);
        if (data == null) {
            // Try normalized search
            String normalized = normalizeSchemeName(identifier);
            data = navCache.get(normalized);
        }

        return data != null ? data.getNav() : null;
    }

    /**
     * Get mutual fund data by identifier
     */
    public MutualFundData getMutualFundData(String identifier) {
        // Check if cache needs update
        if (lastCacheUpdate == null ||
            lastCacheUpdate.plusMinutes(CACHE_DURATION_MINUTES).isBefore(LocalDateTime.now())) {
            updateNavCache();
        }

        MutualFundData data = navCache.get(identifier);
        if (data == null) {
            // Try normalized search
            String normalized = normalizeSchemeName(identifier);
            data = navCache.get(normalized);
        }

        return data;
    }

    /**
     * Search mutual funds by name
     */
    public List<Map<String, Object>> searchMutualFunds(String query) {
        if (query == null || query.trim().length() < 2) {
            return new ArrayList<>();
        }

        // Check if cache needs update
        if (lastCacheUpdate == null ||
            lastCacheUpdate.plusMinutes(CACHE_DURATION_MINUTES).isBefore(LocalDateTime.now())) {
            updateNavCache();
        }

        String searchQuery = query.toLowerCase().trim();
        return navCache.values().stream()
            .filter(data -> data.getSchemeName().toLowerCase().contains(searchQuery))
            .distinct()
            .limit(20)
            .map(data -> {
                Map<String, Object> result = new HashMap<>();
                result.put("symbol", data.getSchemeCode());
                result.put("name", data.getSchemeName());
                result.put("nav", data.getNav());
                result.put("date", data.getDate());
                result.put("type", "MUTUAL_FUND");
                return result;
            })
            .collect(Collectors.toList());
    }


    /**
     * Get popular mutual fund suggestions
     */
    public List<Map<String, String>> getPopularMutualFunds() {
        List<Map<String, String>> suggestions = new ArrayList<>();

        // Popular mutual fund categories
        List<String> popularFunds = Arrays.asList(
            "SBI Bluechip Fund",
            "HDFC Top 100 Fund",
            "ICICI Prudential Bluechip Fund",
            "Axis Bluechip Fund",
            "Kotak Bluechip Fund",
            "SBI Small Cap Fund",
            "HDFC Small Cap Fund",
            "ICICI Prudential Smallcap Fund",
            "Axis Small Cap Fund",
            "Kotak Small Cap Fund"
        );

        for (String fundName : popularFunds) {
            MutualFundData data = getMutualFundData(fundName);
            if (data != null) {
                Map<String, String> suggestion = new HashMap<>();
                suggestion.put("symbol", data.getSchemeCode());
                suggestion.put("name", data.getSchemeName());
                suggestion.put("type", "MUTUAL_FUND");
                suggestion.put("nav", data.getNav().toString());
                suggestions.add(suggestion);
            }
        }

        return suggestions;
    }

    /**
     * Check if mutual fund service is available
     */
    public boolean isServiceAvailable() {
        try {
            updateNavCache();
            return !navCache.isEmpty();
        } catch (Exception e) {
            return false;
        }
    }

    /**
     * Calculate daily return for a mutual fund
     */
    public BigDecimal getDailyReturn(String identifier) {
        BigDecimal currentNav = getCurrentNav(identifier);
        BigDecimal previousNav = previousNavCache.get(identifier);

        if (currentNav == null || previousNav == null || previousNav.compareTo(BigDecimal.ZERO) == 0) {
            return null; // Cannot calculate return
        }

        // Calculate percentage change: (current - previous) / previous * 100
        BigDecimal change = currentNav.subtract(previousNav);
        return change.divide(previousNav, 4, BigDecimal.ROUND_HALF_UP)
                    .multiply(new BigDecimal("100"));
    }

    /**
     * Get mutual fund data with daily return
     */
    public Map<String, Object> getMutualFundWithReturn(String identifier) {
        MutualFundData data = getMutualFundData(identifier);
        if (data == null) {
            return null;
        }

        Map<String, Object> result = new HashMap<>();
        result.put("schemeCode", data.getSchemeCode());
        result.put("isin", data.getIsin());
        result.put("name", data.getSchemeName());
        result.put("nav", data.getNav());
        result.put("date", data.getDate());
        result.put("dailyReturn", getDailyReturn(identifier));
        result.put("type", "MUTUAL_FUND");

        return result;
    }

    /**
     * Get service status
     */
    public Map<String, Object> getServiceStatus() {
        Map<String, Object> status = new HashMap<>();
        status.put("available", isServiceAvailable());
        status.put("cachedEntries", navCache.size());
        status.put("lastUpdate", lastCacheUpdate);
        return status;
    }
}