package com.financeapp.service;

import com.financeapp.model.Investment;
import com.financeapp.model.InvestmentType;
import com.financeapp.model.User;
import org.apache.poi.ss.usermodel.*;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.apache.poi.hssf.usermodel.HSSFWorkbook;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.*;
import java.util.regex.Pattern;

@Service
public class InvestmentStatementParsingService {

    @Autowired
    private InvestmentService investmentService;

    private static final Pattern ISIN_PATTERN = Pattern.compile("^[A-Z]{2}[A-Z0-9]{9}[0-9]$");

    public Map<String, Object> parseStatement(MultipartFile file, String platform, User user) throws IOException {
        String filename = file.getOriginalFilename();
        if (filename == null) {
            throw new IllegalArgumentException("Invalid file");
        }

        List<Investment> parsedInvestments;
        
        switch (platform.toUpperCase()) {
            case "GROWW":
                parsedInvestments = parseGrowwStatement(file, user);
                break;
            case "ZERODHA":
                parsedInvestments = parseZerodhaStatement(file, user);
                break;
            case "UPSTOX":
                parsedInvestments = parseUpstoxStatement(file, user);
                break;
            default:
                parsedInvestments = parseGenericStatement(file, user);
        }

        // Save parsed investments
        int successCount = 0;
        int failureCount = 0;
        List<String> errors = new ArrayList<>();

        for (Investment investment : parsedInvestments) {
            try {
                // Check if investment already exists
                boolean exists = investmentService.getUserInvestments(user).stream()
                    .anyMatch(existing -> 
                        existing.getSymbol().equals(investment.getSymbol()) &&
                        existing.getName().equals(investment.getName())
                    );

                if (!exists) {
                    investmentService.createInvestment(investment, user);
                    successCount++;
                } else {
                    // Update existing investment quantity and average price
                    Investment existing = investmentService.getUserInvestments(user).stream()
                        .filter(inv -> inv.getSymbol().equals(investment.getSymbol()) && 
                                      inv.getName().equals(investment.getName()))
                        .findFirst()
                        .orElse(null);
                    
                    if (existing != null) {
                        // Calculate new average price
                        BigDecimal totalValue = existing.getPurchasePrice()
                            .multiply(existing.getQuantity())
                            .add(investment.getPurchasePrice().multiply(investment.getQuantity()));
                        BigDecimal totalQuantity = existing.getQuantity().add(investment.getQuantity());
                        BigDecimal newAvgPrice = totalValue.divide(totalQuantity, 2, BigDecimal.ROUND_HALF_UP);
                        
                        existing.setQuantity(totalQuantity);
                        existing.setPurchasePrice(newAvgPrice);
                        existing.setCurrentPrice(investment.getCurrentPrice());
                        
                        investmentService.updateInvestment(existing.getId(), existing, user);
                        successCount++;
                    }
                }
            } catch (Exception e) {
                failureCount++;
                errors.add("Failed to process " + investment.getSymbol() + ": " + e.getMessage());
            }
        }

        Map<String, Object> result = new HashMap<>();
        result.put("platform", platform);
        result.put("totalParsed", parsedInvestments.size());
        result.put("successCount", successCount);
        result.put("failureCount", failureCount);
        result.put("errors", errors);
        result.put("message", String.format("Successfully processed %d investments from %s statement", 
            successCount, platform));

        return result;
    }

    private List<Investment> parseGrowwStatement(MultipartFile file, User user) throws IOException {
        List<Investment> investments = new ArrayList<>();
        
        try (Workbook workbook = file.getOriginalFilename().toLowerCase().endsWith(".xlsx") ?
                new XSSFWorkbook(file.getInputStream()) : new HSSFWorkbook(file.getInputStream())) {
            
            Sheet sheet = workbook.getSheetAt(0);
            
            // Find the data table start
            int dataStartRow = findGrowwDataStart(sheet);
            if (dataStartRow == -1) {
                throw new IllegalArgumentException("Could not find investment data in the statement");
            }
            
            // Parse each row
            for (int i = dataStartRow; i <= sheet.getLastRowNum(); i++) {
                Row row = sheet.getRow(i);
                if (row == null) continue;
                
                try {
                    Investment investment = parseGrowwRow(row, user);
                    if (investment != null) {
                        investments.add(investment);
                    }
                } catch (Exception e) {
                    System.err.println("Error parsing row " + i + ": " + e.getMessage());
                    // Continue processing other rows
                }
            }
        }
        
        return investments;
    }

    private int findGrowwDataStart(Sheet sheet) {
        // Look for header row with "Stock Name", "ISIN", "Quantity", etc.
        for (int i = 0; i <= Math.min(20, sheet.getLastRowNum()); i++) {
            Row row = sheet.getRow(i);
            if (row == null) continue;
            
            String firstCell = getCellStringValue(row.getCell(0));
            if (firstCell != null && firstCell.toLowerCase().contains("stock name")) {
                return i + 1; // Return the row after header
            }
        }
        return -1;
    }

    private Investment parseGrowwRow(Row row, User user) {
        try {
            // Expected columns based on Groww format:
            // Stock Name | ISIN | Quantity | Average buy price | Buy value | Closing price | Closing value | Unrealised P&L
            
            String stockName = getCellStringValue(row.getCell(0));
            String isin = getCellStringValue(row.getCell(1));
            BigDecimal quantity = getCellNumericValue(row.getCell(2));
            BigDecimal avgBuyPrice = getCellNumericValue(row.getCell(3));
            BigDecimal buyValue = getCellNumericValue(row.getCell(4));
            BigDecimal closingPrice = getCellNumericValue(row.getCell(5));
            BigDecimal closingValue = getCellNumericValue(row.getCell(6));
            BigDecimal unrealizedPL = getCellNumericValue(row.getCell(7));
            
            // Validate required fields
            if (stockName == null || stockName.trim().isEmpty() || 
                quantity == null || quantity.compareTo(BigDecimal.ZERO) <= 0 ||
                avgBuyPrice == null || avgBuyPrice.compareTo(BigDecimal.ZERO) <= 0) {
                return null;
            }
            
            // Create investment object
            Investment investment = new Investment();
            investment.setName(stockName.trim());
            
            // Generate symbol from stock name if not available
            String symbol = generateSymbolFromName(stockName);
            investment.setSymbol(symbol);
            
            investment.setType(InvestmentType.STOCK);
            investment.setQuantity(quantity);
            investment.setPurchasePrice(avgBuyPrice);
            investment.setCurrentPrice(closingPrice != null ? closingPrice : avgBuyPrice);
            investment.setPurchaseDate(LocalDateTime.now()); // Use current date as we don't have exact purchase date
            investment.setSector("Unknown"); // Will be updated later if needed
            investment.setNotes("Imported from Groww statement");
            investment.setLivePriceEnabled(true);
            
            // Add ISIN in notes if available
            if (isin != null && !isin.trim().isEmpty() && ISIN_PATTERN.matcher(isin.trim()).matches()) {
                investment.setNotes("ISIN: " + isin.trim() + " | Imported from Groww statement");
            }
            
            return investment;
            
        } catch (Exception e) {
            System.err.println("Error parsing Groww row: " + e.getMessage());
            return null;
        }
    }

    private List<Investment> parseZerodhaStatement(MultipartFile file, User user) throws IOException {
        // Similar implementation for Zerodha format
        // This is a placeholder - can be implemented based on Zerodha statement format
        return new ArrayList<>();
    }

    private List<Investment> parseUpstoxStatement(MultipartFile file, User user) throws IOException {
        // Similar implementation for Upstox format
        // This is a placeholder - can be implemented based on Upstox statement format
        return new ArrayList<>();
    }

    private List<Investment> parseGenericStatement(MultipartFile file, User user) throws IOException {
        // Generic parser that tries to identify common columns
        List<Investment> investments = new ArrayList<>();
        
        try (Workbook workbook = file.getOriginalFilename().toLowerCase().endsWith(".xlsx") ?
                new XSSFWorkbook(file.getInputStream()) : new HSSFWorkbook(file.getInputStream())) {
            
            Sheet sheet = workbook.getSheetAt(0);
            
            // Find header row
            Row headerRow = findGenericHeaderRow(sheet);
            if (headerRow == null) {
                throw new IllegalArgumentException("Could not identify header row in the statement");
            }
            
            Map<String, Integer> columnMap = mapGenericColumns(headerRow);
            
            // Parse data rows
            for (int i = headerRow.getRowNum() + 1; i <= sheet.getLastRowNum(); i++) {
                Row row = sheet.getRow(i);
                if (row == null) continue;
                
                try {
                    Investment investment = parseGenericRow(row, columnMap, user);
                    if (investment != null) {
                        investments.add(investment);
                    }
                } catch (Exception e) {
                    System.err.println("Error parsing generic row " + i + ": " + e.getMessage());
                }
            }
        }
        
        return investments;
    }

    private Row findGenericHeaderRow(Sheet sheet) {
        for (int i = 0; i <= Math.min(10, sheet.getLastRowNum()); i++) {
            Row row = sheet.getRow(i);
            if (row == null) continue;
            
            // Check if row contains common investment headers
            String rowText = "";
            for (Cell cell : row) {
                rowText += getCellStringValue(cell) + " ";
            }
            rowText = rowText.toLowerCase();
            
            if ((rowText.contains("stock") || rowText.contains("security") || rowText.contains("instrument")) &&
                (rowText.contains("quantity") || rowText.contains("qty")) &&
                (rowText.contains("price") || rowText.contains("rate"))) {
                return row;
            }
        }
        return null;
    }

    private Map<String, Integer> mapGenericColumns(Row headerRow) {
        Map<String, Integer> columnMap = new HashMap<>();
        
        for (Cell cell : headerRow) {
            String header = getCellStringValue(cell);
            if (header == null) continue;
            
            header = header.toLowerCase().trim();
            int colIndex = cell.getColumnIndex();
            
            // Map common column names
            if (header.contains("stock") || header.contains("security") || header.contains("instrument") || header.contains("name")) {
                columnMap.put("name", colIndex);
            } else if (header.contains("symbol") || header.contains("scrip")) {
                columnMap.put("symbol", colIndex);
            } else if (header.contains("quantity") || header.contains("qty") || header.contains("shares")) {
                columnMap.put("quantity", colIndex);
            } else if (header.contains("avg") && (header.contains("price") || header.contains("rate"))) {
                columnMap.put("avgPrice", colIndex);
            } else if (header.contains("buy") && (header.contains("price") || header.contains("rate"))) {
                columnMap.put("buyPrice", colIndex);
            } else if (header.contains("current") && (header.contains("price") || header.contains("rate"))) {
                columnMap.put("currentPrice", colIndex);
            } else if (header.contains("closing") && (header.contains("price") || header.contains("rate"))) {
                columnMap.put("currentPrice", colIndex);
            }
        }
        
        return columnMap;
    }

    private Investment parseGenericRow(Row row, Map<String, Integer> columnMap, User user) {
        try {
            String name = columnMap.containsKey("name") ? 
                getCellStringValue(row.getCell(columnMap.get("name"))) : null;
            String symbol = columnMap.containsKey("symbol") ? 
                getCellStringValue(row.getCell(columnMap.get("symbol"))) : null;
            BigDecimal quantity = columnMap.containsKey("quantity") ? 
                getCellNumericValue(row.getCell(columnMap.get("quantity"))) : null;
            BigDecimal avgPrice = columnMap.containsKey("avgPrice") ? 
                getCellNumericValue(row.getCell(columnMap.get("avgPrice"))) : null;
            BigDecimal buyPrice = columnMap.containsKey("buyPrice") ? 
                getCellNumericValue(row.getCell(columnMap.get("buyPrice"))) : null;
            BigDecimal currentPrice = columnMap.containsKey("currentPrice") ? 
                getCellNumericValue(row.getCell(columnMap.get("currentPrice"))) : null;
            
            // Use avgPrice or buyPrice as purchase price
            BigDecimal purchasePrice = avgPrice != null ? avgPrice : buyPrice;
            
            // Validate required fields
            if (name == null || name.trim().isEmpty() || 
                quantity == null || quantity.compareTo(BigDecimal.ZERO) <= 0 ||
                purchasePrice == null || purchasePrice.compareTo(BigDecimal.ZERO) <= 0) {
                return null;
            }
            
            Investment investment = new Investment();
            investment.setName(name.trim());
            investment.setSymbol(symbol != null ? symbol.trim() : generateSymbolFromName(name));
            investment.setType(InvestmentType.STOCK);
            investment.setQuantity(quantity);
            investment.setPurchasePrice(purchasePrice);
            investment.setCurrentPrice(currentPrice != null ? currentPrice : purchasePrice);
            investment.setPurchaseDate(LocalDateTime.now());
            investment.setSector("Unknown");
            investment.setNotes("Imported from investment statement");
            investment.setLivePriceEnabled(true);
            
            return investment;
            
        } catch (Exception e) {
            System.err.println("Error parsing generic investment row: " + e.getMessage());
            return null;
        }
    }

    private String getCellStringValue(Cell cell) {
        if (cell == null) return null;
        
        switch (cell.getCellType()) {
            case STRING:
                return cell.getStringCellValue();
            case NUMERIC:
                return String.valueOf(cell.getNumericCellValue());
            case BOOLEAN:
                return String.valueOf(cell.getBooleanCellValue());
            case FORMULA:
                try {
                    return cell.getStringCellValue();
                } catch (Exception e) {
                    return String.valueOf(cell.getNumericCellValue());
                }
            default:
                return null;
        }
    }

    private BigDecimal getCellNumericValue(Cell cell) {
        if (cell == null) return null;
        
        try {
            switch (cell.getCellType()) {
                case NUMERIC:
                    return BigDecimal.valueOf(cell.getNumericCellValue());
                case STRING:
                    String str = cell.getStringCellValue().replaceAll("[^0-9.-]", "");
                    return str.isEmpty() ? null : new BigDecimal(str);
                case FORMULA:
                    return BigDecimal.valueOf(cell.getNumericCellValue());
                default:
                    return null;
            }
        } catch (Exception e) {
            return null;
        }
    }

    private String generateSymbolFromName(String name) {
        if (name == null || name.trim().isEmpty()) {
            return "UNKNOWN";
        }
        
        // Extract symbol from company name
        String symbol = name.trim().toUpperCase();
        
        // Common transformations
        symbol = symbol.replace(" LTD", "").replace(" LIMITED", "")
                      .replace(" CORP", "").replace(" CORPORATION", "")
                      .replace(" INC", "").replace(" COMPANY", "")
                      .replace(" CO.", "").replace(".", "")
                      .replace(" ", "");
        
        // Limit to reasonable length
        if (symbol.length() > 10) {
            symbol = symbol.substring(0, 10);
        }
        
        return symbol;
    }
}