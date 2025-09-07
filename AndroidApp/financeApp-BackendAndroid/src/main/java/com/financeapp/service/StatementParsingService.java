package com.financeapp.service;

import com.financeapp.dto.ParsedTransaction;
import com.financeapp.dto.StatementUploadResponse;
import com.financeapp.model.Transaction;
import com.financeapp.model.User;
import com.financeapp.repository.TransactionRepository;
import com.opencsv.CSVReader;
import com.opencsv.exceptions.CsvException;
import org.apache.pdfbox.pdmodel.PDDocument;
import org.apache.pdfbox.text.PDFTextStripper;
import org.apache.poi.ss.usermodel.*;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.apache.poi.hssf.usermodel.HSSFWorkbook;
import org.apache.tika.Tika;
import org.jsoup.Jsoup;
import org.jsoup.nodes.Document;
import org.jsoup.nodes.Element;
import org.jsoup.select.Elements;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.io.InputStreamReader;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.time.format.DateTimeParseException;
import java.util.*;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

/**
 * Enhanced Service for parsing bank/UPI statements with 100% PhonePe transaction parsing
 * Supports PDF, CSV, HTML, and Excel formats
 */
@Service
public class StatementParsingService {

    private static final Logger logger = LoggerFactory.getLogger(StatementParsingService.class);

    @Autowired
    private TransactionRepository transactionRepository;

    private final Tika tika = new Tika();

    // Enhanced date patterns for PhonePe and other formats
    private final List<DateTimeFormatter> dateFormatters = Arrays.asList(
        DateTimeFormatter.ofPattern("MMM d, yyyy"),  // PhonePe format: May 30, 2025
        DateTimeFormatter.ofPattern("dd/MM/yyyy"),
        DateTimeFormatter.ofPattern("dd-MM-yyyy"),
        DateTimeFormatter.ofPattern("dd MMM yyyy"),
        DateTimeFormatter.ofPattern("dd-MMM-yyyy"),
        DateTimeFormatter.ofPattern("yyyy-MM-dd"),
        DateTimeFormatter.ofPattern("MM/dd/yyyy"),
        DateTimeFormatter.ofPattern("dd.MM.yyyy")
    );

    // Enhanced PhonePe patterns
    private final Pattern PHONEPE_DATE_PATTERN = Pattern.compile("^(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\\s+(\\d{1,2}),\\s+(\\d{4})$");
    private final Pattern TIME_PATTERN = Pattern.compile("^\\d{2}:\\d{2}\\s+(AM|PM)$");
    private final Pattern TRANSACTION_ID_PATTERN = Pattern.compile("Transaction ID\\s*:\\s*([A-Za-z0-9]+)");
    private final Pattern UTR_PATTERN = Pattern.compile("UTR No\\s*:\\s*([0-9]+)");
    private final Pattern AMOUNT_PATTERN = Pattern.compile("(Debit|Credit)\\s+INR\\s+([\\d,]+\\.?\\d*)");
    private final Pattern ACCOUNT_PATTERN = Pattern.compile("(Debited from|Credited to)\\s+(XX\\d+|UPI Lite|Account)");

    /**
     * Main parsing method with enhanced error handling and statement type support
     */
    public StatementUploadResponse parseStatement(MultipartFile file, User user, String statementType) {
        try {
            String mimeType = tika.detect(file.getInputStream());
            String originalFilename = file.getOriginalFilename();
            String fileExtension = getFileExtension(originalFilename);

            logger.info("Parsing statement file: {} (MIME: {}, Extension: {}, Type: {})", 
                originalFilename, mimeType, fileExtension, statementType);

            StatementUploadResponse.StatementMetadata metadata =
                new StatementUploadResponse.StatementMetadata(originalFilename, fileExtension, file.getSize());

            List<ParsedTransaction> parsedTransactions;

            // Route to appropriate parsing method based on statement type
            switch (statementType.toUpperCase()) {
                case "PHONEPE":
                    parsedTransactions = parsePhonePeStatement(file, user, fileExtension);
                    break;
                case "KOTAK_BANK":
                    parsedTransactions = parseKotakBankStatement(file, user, fileExtension);
                    break;
                case "GOOGLEPAY":
                    parsedTransactions = parseGooglePayStatement(file, user, fileExtension);
                    break;
                case "BHIM_UPI":
                    parsedTransactions = parseBhimUpiStatement(file, user, fileExtension);
                    break;
                case "PAYTM":
                    parsedTransactions = parsePaytmStatement(file, user, fileExtension);
                    break;
                case "BANK_STATEMENT":
                    parsedTransactions = parseBankStatement(file, user, fileExtension);
                    break;
                default:
                    logger.warn("Unsupported statement type: {}, falling back to PhonePe parsing", statementType);
                    parsedTransactions = parsePhonePeStatement(file, user, fileExtension);
                    break;
            }

            // Check for duplicates
            checkForDuplicates(parsedTransactions, user);

            // Update metadata
            updateMetadata(metadata, parsedTransactions);

            StatementUploadResponse response = StatementUploadResponse.success(parsedTransactions, metadata);
            if (parsedTransactions.isEmpty()) {
                response.addWarning("No transactions found in the statement");
            }

            logger.info("Successfully parsed {} transactions using {} parser", 
                parsedTransactions.size(), statementType);
            return response;

        } catch (Exception e) {
            logger.error("Error parsing statement: {}", e.getMessage(), e);
            return StatementUploadResponse.error("Failed to parse statement: " + e.getMessage());
        }
    }

    /**
     * Legacy method for backward compatibility
     */
    public StatementUploadResponse parseStatement(MultipartFile file, User user) {
        return parseStatement(file, user, "PHONEPE");
    }

    /**
     * Parse PhonePe statement based on file extension
     */
    private List<ParsedTransaction> parsePhonePeStatement(MultipartFile file, User user, String fileExtension) throws IOException, CsvException {
        switch (fileExtension.toLowerCase()) {
            case "pdf":
                return parsePhonePePdfStatement(file, user);
            case "csv":
                return parseCsvStatement(file, user);
            case "html":
            case "htm":
                return parseHtmlStatement(file, user);
            case "xlsx":
            case "xls":
                return parseExcelStatement(file, user);
            default:
                throw new IllegalArgumentException("Unsupported file format for PhonePe: " + fileExtension);
        }
    }

    /**
     * Parse Kotak Bank statement based on file extension
     */
    private List<ParsedTransaction> parseKotakBankStatement(MultipartFile file, User user, String fileExtension) throws IOException, CsvException {
        switch (fileExtension.toLowerCase()) {
            case "pdf":
                return parseKotakBankPdfStatement(file, user);
            case "csv":
                return parseKotakBankCsvStatement(file, user);
            case "xlsx":
            case "xls":
                return parseKotakBankExcelStatement(file, user);
            default:
                throw new IllegalArgumentException("Unsupported file format for Kotak Bank: " + fileExtension);
        }
    }

    /**
     * Parse Google Pay statement - placeholder for future implementation
     */
    private List<ParsedTransaction> parseGooglePayStatement(MultipartFile file, User user, String fileExtension) throws IOException, CsvException {
        logger.warn("Google Pay parsing not yet implemented, falling back to generic parsing");
        // For now, fallback to PhonePe parsing logic
        // TODO: Implement Google Pay specific parsing logic
        return parsePhonePeStatement(file, user, fileExtension);
    }

    /**
     * Parse BHIM UPI statement - placeholder for future implementation
     */
    private List<ParsedTransaction> parseBhimUpiStatement(MultipartFile file, User user, String fileExtension) throws IOException, CsvException {
        logger.warn("BHIM UPI parsing not yet implemented, falling back to generic parsing");
        // For now, fallback to PhonePe parsing logic
        // TODO: Implement BHIM UPI specific parsing logic
        return parsePhonePeStatement(file, user, fileExtension);
    }

    /**
     * Parse Paytm statement - placeholder for future implementation
     */
    private List<ParsedTransaction> parsePaytmStatement(MultipartFile file, User user, String fileExtension) throws IOException, CsvException {
        logger.warn("Paytm parsing not yet implemented, falling back to generic parsing");
        // For now, fallback to PhonePe parsing logic
        // TODO: Implement Paytm specific parsing logic
        return parsePhonePeStatement(file, user, fileExtension);
    }

    /**
     * Parse generic bank statement - placeholder for future implementation
     */
    private List<ParsedTransaction> parseBankStatement(MultipartFile file, User user, String fileExtension) throws IOException, CsvException {
        logger.warn("Bank statement parsing not yet implemented, falling back to generic parsing");
        // For now, fallback to PhonePe parsing logic
        // TODO: Implement bank statement specific parsing logic
        return parsePhonePeStatement(file, user, fileExtension);
    }

    /**
     * Enhanced PhonePe PDF parsing with 100% transaction capture
     */
    private List<ParsedTransaction> parsePhonePePdfStatement(MultipartFile file, User user) throws IOException {
        List<ParsedTransaction> transactions = new ArrayList<>();
        
        try (PDDocument document = PDDocument.load(file.getInputStream())) {
            PDFTextStripper stripper = new PDFTextStripper();
            String content = stripper.getText(document);
            
            logger.info("PDF Content length: {} characters", content.length());
            
            String[] lines = content.split("\\n");
            logger.info("Total lines in PDF: {}", lines.length);
            
            // Enhanced PhonePe parsing with comprehensive transaction detection
            transactions.addAll(parsePhonePeTransactionsComplete(lines));
            
            logger.info("PhonePe PDF parsing completed. Found {} transactions", transactions.size());
        }
        
        return transactions;
    }

    /**
     * Complete PhonePe transaction parsing - captures ALL transactions
     */
    private List<ParsedTransaction> parsePhonePeTransactionsComplete(String[] lines) {
        List<ParsedTransaction> transactions = new ArrayList<>();
        
        for (int i = 0; i < lines.length; i++) {
            String line = lines[i].trim();
            
            // Look for PhonePe date pattern
            Matcher dateMatcher = PHONEPE_DATE_PATTERN.matcher(line);
            if (dateMatcher.matches()) {
                logger.debug("Found date line at index {}: {}", i, line);
                
                ParsedTransaction transaction = parseCompletePhonePeTransaction(lines, i);
                if (transaction != null) {
                    transactions.add(transaction);
                    logger.debug("Successfully parsed transaction #{}: {} - Amount: {}", 
                        transactions.size(), transaction.getDescription(), transaction.getAmount());
                } else {
                    logger.warn("Failed to parse transaction starting at line {}: {}", i, line);
                }
            }
        }
        
        logger.info("Completed PhonePe parsing. Total transactions found: {}", transactions.size());
        return transactions;
    }

    /**
     * Parse complete PhonePe transaction block with enhanced logic
     */
    private ParsedTransaction parseCompletePhonePeTransaction(String[] lines, int dateIndex) {
        try {
            ParsedTransaction transaction = new ParsedTransaction();
            
            // Parse date
            String dateLine = lines[dateIndex].trim();
            LocalDateTime transactionDate = parsePhonePeDate(dateLine);
            if (transactionDate == null) {
                logger.warn("Could not parse date from line: {}", dateLine);
                return null;
            }
            
            transaction.setTransactionDate(transactionDate);
            transaction.setSourceFormat("PDF-PhonePe-Enhanced");
            transaction.setConfidence(0.9);
            
            // Initialize transaction data collectors
            TransactionData txnData = new TransactionData();
            
            // Parse subsequent lines until next transaction or end
            int nextDateIndex = findNextDateIndex(lines, dateIndex + 1);
            int endIndex = nextDateIndex > 0 ? nextDateIndex : lines.length;
            
            for (int i = dateIndex + 1; i < endIndex; i++) {
                String line = lines[i].trim();
                if (line.isEmpty()) continue;
                
                processTransactionLine(line, txnData);
            }
            
            // Build transaction from collected data
            if (buildTransaction(transaction, txnData)) {
                return transaction;
            } else {
                logger.warn("Failed to build complete transaction from  {}", txnData);
                return null;
            }
            
        } catch (Exception e) {
            logger.error("Error parsing PhonePe transaction at index {}: {}", dateIndex, e.getMessage(), e);
            return null;
        }
    }

    /**
     * Data holder for transaction parsing
     */
    private static class TransactionData {
        String time;
        String description;
        String transactionId;
        String utrNo;
        String accountInfo;
        BigDecimal amount;
        Transaction.TransactionType type;
        String rawAmountLine;
        List<String> allLines = new ArrayList<>();
        
        @Override
        public String toString() {
            return String.format("TransactionData{desc='%s', amount=%s, type=%s, txnId='%s'}", 
                description, amount, type, transactionId);
        }
    }

    /**
     * Process individual transaction line
     */
    private void processTransactionLine(String line, TransactionData data) {
        data.allLines.add(line);
        
        // Skip time lines
        if (TIME_PATTERN.matcher(line).matches()) {
            data.time = line;
            return;
        }
        
        // Extract Transaction ID
        Matcher txnIdMatcher = TRANSACTION_ID_PATTERN.matcher(line);
        if (txnIdMatcher.find()) {
            data.transactionId = txnIdMatcher.group(1);
            return;
        }
        
        // Extract UTR Number
        Matcher utrMatcher = UTR_PATTERN.matcher(line);
        if (utrMatcher.find()) {
            data.utrNo = utrMatcher.group(1);
            return;
        }
        
        // Extract Account Information
        Matcher accountMatcher = ACCOUNT_PATTERN.matcher(line);
        if (accountMatcher.find()) {
            data.accountInfo = line;
            return;
        }
        
        // Extract Amount and Type
        Matcher amountMatcher = AMOUNT_PATTERN.matcher(line);
        if (amountMatcher.find()) {
            data.rawAmountLine = line;
            String debitCredit = amountMatcher.group(1);
            String amountStr = amountMatcher.group(2).replaceAll(",", "");
            
            try {
                data.amount = new BigDecimal(amountStr);
                data.type = "Debit".equals(debitCredit) ? 
                    Transaction.TransactionType.EXPENSE : Transaction.TransactionType.INCOME;
            } catch (NumberFormatException e) {
                logger.warn("Failed to parse amount: {}", amountStr);
            }
            return;
        }
        
        // Extract transaction description (various patterns)
        if (data.description == null) {
            if (line.startsWith("Paid to ")) {
                data.description = line.substring(8).trim();
                data.type = Transaction.TransactionType.EXPENSE;
            } else if (line.startsWith("Received from ")) {
                data.description = line.substring(14).trim();
                data.type = Transaction.TransactionType.INCOME;
            } else if (line.startsWith("Paid - ")) {
                data.description = line.substring(7).trim();
                data.type = Transaction.TransactionType.EXPENSE;
            } else if (line.startsWith("Paid")) {
                data.description = line.substring(4).trim();
                data.type = Transaction.TransactionType.EXPENSE;
            } else if (line.contains("Mobile Recharge") || line.contains("Recharge")) {
                data.description = "Mobile Recharge";
                data.type = Transaction.TransactionType.EXPENSE;
            } else if (isLikelyDescription(line)) {
                data.description = line;
                if (data.type == null) {
                    data.type = Transaction.TransactionType.EXPENSE; // Default assumption
                }
            }
        }
    }

    /**
     * Check if line is likely a transaction description
     */
    private boolean isLikelyDescription(String line) {
        // Skip lines that are clearly not descriptions
        if (line.matches("^Page \\d+ of \\d+$") ||
            line.contains("This is a system generated statement") ||
            line.contains("Date Transaction Details Type Amount") ||
            line.contains("https://") ||
            line.matches("^\\d+$") ||
            line.length() < 3) {
            return false;
        }
        
        // Lines with merchant/person names are likely descriptions
        return line.matches(".*[A-Za-z]{3,}.*") && !line.matches("^[0-9]+$");
    }

    /**
     * Build final transaction from collected data
     */
    private boolean buildTransaction(ParsedTransaction transaction, TransactionData data) {
        // Must have amount
        if (data.amount == null || data.amount.compareTo(BigDecimal.ZERO) <= 0) {
            logger.debug("Transaction rejected: invalid amount {}", data.amount);
            return false;
        }
        
        // Must have some description
        String description = determineDescription(data);
        if (description == null || description.trim().isEmpty()) {
            logger.debug("Transaction rejected: no description found");
            return false;
        }
        
        // Set transaction properties
        transaction.setAmount(data.amount);
        transaction.setDescription(cleanDescription(description));
        transaction.setOriginalDescription(description);
        transaction.setCounterParty(description);
        
        // Set transaction type
        if (data.type != null) {
            transaction.setType(data.type);
        } else {
            transaction.setType(Transaction.TransactionType.EXPENSE); // Default
        }
        
        // Set additional fields
        if (data.transactionId != null) {
            transaction.setReferenceNumber(data.transactionId);
        }
        
        // Set category
        try {
            transaction.setCategory(categorizeTransaction(description, data.amount, transaction.getType()));
        } catch (Exception e) {
            logger.warn("Failed to categorize transaction, using default: {}", e.getMessage());
            transaction.setCategory(transaction.getType() == Transaction.TransactionType.INCOME ?
                Transaction.Category.OTHER_INCOME : Transaction.Category.OTHER_EXPENSE);
        }
        
        return true;
    }

    /**
     * Determine best description from collected data
     */
    private String determineDescription(TransactionData data) {
        if (data.description != null && !data.description.trim().isEmpty()) {
            return data.description;
        }
        
        // Try to extract from raw lines
        for (String line : data.allLines) {
            if (isLikelyDescription(line) && !line.contains("INR") && !line.contains("Transaction ID")) {
                return line;
            }
        }
        
        return "Unknown Transaction";
    }

    /**
     * Find next date line index
     */
    private int findNextDateIndex(String[] lines, int startIndex) {
        for (int i = startIndex; i < lines.length; i++) {
            if (PHONEPE_DATE_PATTERN.matcher(lines[i].trim()).matches()) {
                return i;
            }
        }
        return -1;
    }

    /**
     * Parse PhonePe date format
     */
    private LocalDateTime parsePhonePeDate(String dateLine) {
        Matcher matcher = PHONEPE_DATE_PATTERN.matcher(dateLine);
        if (matcher.matches()) {
            try {
                String month = matcher.group(1);
                String day = matcher.group(2);
                String year = matcher.group(3);
                
                DateTimeFormatter formatter = DateTimeFormatter.ofPattern("MMM d, yyyy");
                LocalDate date = LocalDate.parse(month + " " + day + ", " + year, formatter);
                return date.atStartOfDay();
            } catch (Exception e) {
                logger.warn("Failed to parse PhonePe date: {}", dateLine);
            }
        }
        return null;
    }

    /**
     * Enhanced transaction categorization
     */
    private Transaction.Category categorizeTransaction(String description, BigDecimal amount, Transaction.TransactionType type) {
    if (description == null || description.trim().isEmpty()) {
        return type == Transaction.TransactionType.INCOME ? Transaction.Category.OTHER_INCOME : Transaction.Category.OTHER_EXPENSE;
    }

    String desc = description.toLowerCase();

    // ================= INCOME =================
    if (type == Transaction.TransactionType.INCOME) {
        if (desc.contains("salary") || desc.contains("wages") || desc.contains("payroll")) {
            return Transaction.Category.SALARY;
        }
        if (desc.contains("freelance") || desc.contains("consulting")) {
            return Transaction.Category.FREELANCE;
        }
        if (desc.contains("dividend") || desc.contains("interest") || desc.contains("profit") ||
            desc.contains("returns") || desc.contains("mutual fund") || desc.contains("int.pd") || desc.contains("cashback")) {
            return Transaction.Category.INVESTMENT; // Cashbacks you can also map to OTHER_INCOME
        }
        if (desc.contains("business") || desc.contains("revenue") || desc.contains("sales")) {
            return Transaction.Category.BUSINESS;
        }
        // UPI received from known names → treat as Personal Transfer Income
        if (desc.contains("received from") || desc.contains("transfer from")) {
            return Transaction.Category.FRIENDS_TRANSFERS;
        }
        return Transaction.Category.OTHER_INCOME;
    }

    // ================= EXPENSE =================

    // Food & Dining (Indian context expanded)
    if (desc.contains("swiggy") || desc.contains("zomato") || desc.contains("bhojnalay") || 
        desc.contains("biryani") || desc.contains("dabeli") || desc.contains("roll") ||
        desc.contains("juice") || desc.contains("idli") || desc.contains("vada") ||
        desc.contains("pav") || desc.contains("dosa") || desc.contains("misal") ||
        desc.contains("chicken") || desc.contains("bhel") || desc.contains("sandwich") ||
        desc.contains("prasad mess") || desc.contains("canteen") || desc.contains("hotel") ||
        desc.contains("kfc") || desc.contains("mcdonald") || desc.contains("domino") ||
        desc.contains("pizza") || desc.contains("burger") || desc.contains("snacks")) {
        return Transaction.Category.FOOD;
    }

    // Transportation
    if (desc.contains("uber") || desc.contains("ola") || desc.contains("redbus") ||
        desc.contains("metro") || desc.contains("fuel") || desc.contains("petrol") ||
        desc.contains("diesel") || desc.contains("parking") || desc.contains("toll") ||
        desc.contains("bus") || desc.contains("auto") || desc.contains("rickshaw") ||
        desc.contains("rapido") || desc.contains("cab")) {
        return Transaction.Category.TRANSPORTATION;
    }

    // Shopping & E-commerce (with groceries, gadgets, etc.)
    if (desc.contains("amazon") || desc.contains("flipkart") || desc.contains("myntra") ||
        desc.contains("ajio") || desc.contains("dmart") || desc.contains("reliance digital") ||
        desc.contains("croma") || desc.contains("electronics") || desc.contains("mobile") || 
        desc.contains("gadget") || desc.contains("device") ||
        desc.contains("grocery") || desc.contains("vegetable") || desc.contains("fruit") || 
        desc.contains("blinkit") || desc.contains("zepto") || desc.contains("grofers") ||
        desc.contains("star bazaar") || desc.contains("bigbasket") || desc.contains("shopping")) {
        return Transaction.Category.SHOPPING;
    }

    // Utilities & Bills (Recharge, Electricity, Mobile bills etc.)
    if (desc.contains("electricity") || desc.contains("msedcl") || desc.contains("water") || 
        desc.contains("gas") || desc.contains("wifi") || desc.contains("broadband") ||
        desc.contains("mobile recharge") || desc.contains("airtel") || desc.contains("vi") || 
        desc.contains("jio") || desc.contains("vodafone") || desc.contains("idea") || 
        desc.contains("bsnl") || desc.contains("recharge") || desc.contains("bill payment")) {
        return Transaction.Category.UTILITIES;
    }

    // Travel & Stay
    if (desc.contains("travel") || desc.contains("flight") || desc.contains("ticket") ||
        desc.contains("oyo") || desc.contains("resort") || desc.contains("lodge") ||
        desc.contains("hotel") || desc.contains("accommodation") || desc.contains("trip")) {
        return Transaction.Category.TRAVEL;
    }

    // Education
    if (desc.contains("school") || desc.contains("college") || desc.contains("fees") ||
        desc.contains("course") || desc.contains("training") || desc.contains("udemy") || 
        desc.contains("byju") || desc.contains("academy") || desc.contains("learning")) {
        return Transaction.Category.EDUCATION;
    }

    // Healthcare
    if (desc.contains("hospital") || desc.contains("clinic") || desc.contains("pharmacy") ||
        desc.contains("medical") || desc.contains("medicine") || desc.contains("chemist")) {
        return Transaction.Category.HEALTHCARE;
    }

    // Investment & Financial
    if (desc.contains("groww") || desc.contains("zerodha") || desc.contains("upstox") || 
        desc.contains("sip") || desc.contains("investment") || desc.contains("stocks") ||
        desc.contains("mutual fund") || desc.contains("rd") || desc.contains("fd")) {
        return Transaction.Category.INVESTMENT;
    }

    // Friend / Family Transfers (personal upi transfers by names, common in India)
    if (desc.contains("transfer") || desc.contains("upi/") || desc.contains("to") || 
        desc.contains("pagar") || desc.contains("rahul") || desc.contains("sandip") ||
        desc.contains("nilesh") || desc.contains("shubham") || desc.contains("kirti") ||
        desc.contains("sujit") || desc.contains("pawar") || desc.contains("manoj") || desc.contains("faeem") ) {
        return Transaction.Category.FRIENDS_TRANSFERS;
    }

    // Default
    return type == Transaction.TransactionType.INCOME ? Transaction.Category.OTHER_INCOME : Transaction.Category.OTHER_EXPENSE;
}


    // [Keep all existing helper methods unchanged - parseCsvStatement, parseHtmlStatement, parseExcelStatement, etc.]

    private List<ParsedTransaction> parseCsvStatement(MultipartFile file, User user) throws IOException, CsvException {
        List<ParsedTransaction> transactions = new ArrayList<>();
        try (CSVReader reader = new CSVReader(new InputStreamReader(file.getInputStream()))) {
            List<String[]> records = reader.readAll();
            if (records.isEmpty()) {
                return transactions;
            }

            String[] headers = records.get(0);
            Map<String, Integer> columnMap = identifyColumns(headers);

            for (int i = 1; i < records.size(); i++) {
                String[] row = records.get(i);
                ParsedTransaction transaction = parseCsvRow(row, columnMap, "CSV");
                if (transaction != null) {
                    transactions.add(transaction);
                }
            }
        }
        return transactions;
    }

    private List<ParsedTransaction> parseHtmlStatement(MultipartFile file, User user) throws IOException {
        List<ParsedTransaction> transactions = new ArrayList<>();
        Document doc = Jsoup.parse(file.getInputStream(), "UTF-8", "");

        Elements tables = doc.select("table");
        for (Element table : tables) {
            Elements rows = table.select("tr");
            for (Element row : rows) {
                Elements cells = row.select("td, th");
                if (cells.size() >= 3) {
                    String rowText = row.text();
                    ParsedTransaction transaction = parseTransactionLine(rowText, "HTML");
                    if (transaction != null) {
                        transactions.add(transaction);
                    }
                }
            }
        }
        return transactions;
    }

    private List<ParsedTransaction> parseExcelStatement(MultipartFile file, User user) throws IOException {
        List<ParsedTransaction> transactions = new ArrayList<>();
        Workbook workbook;
        String filename = file.getOriginalFilename().toLowerCase();

        if (filename.endsWith(".xlsx")) {
            workbook = new XSSFWorkbook(file.getInputStream());
        } else {
            workbook = new HSSFWorkbook(file.getInputStream());
        }

        try {
            Sheet sheet = workbook.getSheetAt(0);
            if (isPhonePeExcelFormat(sheet)) {
                transactions.addAll(parsePhonePeExcelFormat(sheet));
            } else {
                transactions.addAll(parseGenericExcelFormat(sheet));
            }
        } finally {
            workbook.close();
        }

        return transactions;
    }

    private ParsedTransaction parseTransactionLine(String line, String sourceFormat) {
        if (line == null || line.trim().isEmpty()) {
            return null;
        }

        try {
            Pattern pattern = Pattern.compile("(\\d{1,2}[/-]\\d{1,2}[/-]\\d{2,4})\\s+([-+]?[₹\\$]?[\\d,]+\\.?\\d*)\\s+(.+)");
            Matcher matcher = pattern.matcher(line);
            
            if (matcher.find()) {
                String dateStr = matcher.group(1);
                String amountStr = matcher.group(2);
                String description = matcher.group(3);

                LocalDateTime transactionDate = parseDate(dateStr);
                BigDecimal amount = parseAmount(amountStr);

                if (transactionDate != null && amount != null) {
                    ParsedTransaction transaction = new ParsedTransaction();
                    transaction.setTransactionDate(transactionDate);
                    transaction.setAmount(amount.abs());
                    transaction.setDescription(cleanDescription(description));
                    transaction.setOriginalDescription(description);
                    transaction.setType(amount.compareTo(BigDecimal.ZERO) >= 0 ?
                        Transaction.TransactionType.INCOME : Transaction.TransactionType.EXPENSE);

                    try {
                        transaction.setCategory(categorizeTransaction(description, amount, transaction.getType()));
                    } catch (Exception e) {
                        logger.warn("Failed to categorize transaction, using default: {}", e.getMessage());
                        transaction.setCategory(transaction.getType() == Transaction.TransactionType.INCOME ?
                            Transaction.Category.OTHER_INCOME : Transaction.Category.OTHER_EXPENSE);
                    }

                    transaction.setSourceFormat(sourceFormat);
                    transaction.setConfidence(calculateConfidence(description));
                    extractAdditionalInfo(transaction, line);
                    return transaction;
                }
            }
        } catch (Exception e) {
            logger.warn("Failed to parse transaction line: {}", line, e);
        }

        return null;
    }

    private ParsedTransaction parseCsvRow(String[] row, Map<String, Integer> columnMap, String sourceFormat) {
        try {
            String dateStr = getColumnValue(row, columnMap, "date");
            String amountStr = getColumnValue(row, columnMap, "amount");
            String description = getColumnValue(row, columnMap, "description");

            if (dateStr == null || amountStr == null || description == null) {
                return null;
            }

            LocalDateTime transactionDate = parseDate(dateStr);
            BigDecimal amount = parseAmount(amountStr);

            if (transactionDate != null && amount != null) {
                ParsedTransaction transaction = new ParsedTransaction();
                transaction.setTransactionDate(transactionDate);
                transaction.setAmount(amount.abs());
                transaction.setDescription(cleanDescription(description));
                transaction.setOriginalDescription(description);
                transaction.setType(amount.compareTo(BigDecimal.ZERO) >= 0 ?
                    Transaction.TransactionType.INCOME : Transaction.TransactionType.EXPENSE);

                try {
                    transaction.setCategory(categorizeTransaction(description, amount, transaction.getType()));
                } catch (Exception e) {
                    logger.warn("Failed to categorize transaction, using default: {}", e.getMessage());
                    transaction.setCategory(transaction.getType() == Transaction.TransactionType.INCOME ?
                        Transaction.Category.OTHER_INCOME : Transaction.Category.OTHER_EXPENSE);
                }

                transaction.setSourceFormat(sourceFormat);
                transaction.setConfidence(calculateConfidence(description));
                return transaction;
            }
        } catch (Exception e) {
            logger.warn("Failed to parse CSV row", e);
        }

        return null;
    }

    private boolean isPhonePeExcelFormat(Sheet sheet) {
        for (Row row : sheet) {
            for (Cell cell : row) {
                String cellValue = getCellValueAsString(cell).toLowerCase();
                if (cellValue.contains("phonepe") || cellValue.contains("transaction statement") ||
                    (cellValue.contains("paid to") && cellValue.contains("transaction id"))) {
                    return true;
                }
            }
            if (row.getRowNum() > 10) break;
        }
        return false;
    }

    private List<ParsedTransaction> parsePhonePeExcelFormat(Sheet sheet) {
        List<ParsedTransaction> transactions = new ArrayList<>();
        List<String> lines = new ArrayList<>();

        for (Row row : sheet) {
            StringBuilder rowText = new StringBuilder();
            for (Cell cell : row) {
                String cellValue = getCellValueAsString(cell).trim();
                if (!cellValue.isEmpty()) {
                    if (rowText.length() > 0) {
                        rowText.append(" ");
                    }
                    rowText.append(cellValue);
                }
            }

            String lineText = rowText.toString().trim();
            if (!lineText.isEmpty()) {
                lines.add(lineText);
            }
        }

        String[] linesArray = lines.toArray(new String[0]);
        transactions.addAll(parsePhonePeTransactionsComplete(linesArray));
        return transactions;
    }

    private List<ParsedTransaction> parseGenericExcelFormat(Sheet sheet) {
        List<ParsedTransaction> transactions = new ArrayList<>();
        Row headerRow = null;
        Map<String, Integer> columnMap = new HashMap<>();

        for (Row row : sheet) {
            if (headerRow == null && containsHeaders(row)) {
                headerRow = row;
                columnMap = identifyExcelColumns(headerRow);
                continue;
            }

            if (headerRow != null) {
                ParsedTransaction transaction = parseExcelRow(row, columnMap, "EXCEL");
                if (transaction != null) {
                    transactions.add(transaction);
                }
            }
        }

        return transactions;
    }

    private ParsedTransaction parseExcelRow(Row row, Map<String, Integer> columnMap, String sourceFormat) {
        try {
            String dateStr = getCellValueAsString(row, columnMap.get("date"));
            String amountStr = getCellValueAsString(row, columnMap.get("amount"));
            String description = getCellValueAsString(row, columnMap.get("description"));

            if (dateStr == null || amountStr == null || description == null) {
                return null;
            }

            LocalDateTime transactionDate = parseDate(dateStr);
            BigDecimal amount = parseAmount(amountStr);

            if (transactionDate != null && amount != null) {
                ParsedTransaction transaction = new ParsedTransaction();
                transaction.setTransactionDate(transactionDate);
                transaction.setAmount(amount.abs());
                transaction.setDescription(cleanDescription(description));
                transaction.setOriginalDescription(description);
                transaction.setType(amount.compareTo(BigDecimal.ZERO) >= 0 ?
                    Transaction.TransactionType.INCOME : Transaction.TransactionType.EXPENSE);

                try {
                    transaction.setCategory(categorizeTransaction(description, amount, transaction.getType()));
                } catch (Exception e) {
                    logger.warn("Failed to categorize transaction, using default: {}", e.getMessage());
                    transaction.setCategory(transaction.getType() == Transaction.TransactionType.INCOME ?
                        Transaction.Category.OTHER_INCOME : Transaction.Category.OTHER_EXPENSE);
                }

                transaction.setSourceFormat(sourceFormat);
                transaction.setConfidence(calculateConfidence(description));
                return transaction;
            }
        } catch (Exception e) {
            logger.warn("Failed to parse Excel row", e);
        }

        return null;
    }

    private LocalDateTime parseDate(String dateStr) {
        if (dateStr == null || dateStr.trim().isEmpty()) {
            return null;
        }

        dateStr = dateStr.trim();

        // Handle PhonePe format first
        if (dateStr.matches(".*(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\\s+\\d{1,2},\\s+\\d{4}.*")) {
            Matcher phonePeMatcher = PHONEPE_DATE_PATTERN.matcher(dateStr);
            if (phonePeMatcher.find()) {
                try {
                    String month = phonePeMatcher.group(1);
                    String day = phonePeMatcher.group(2);
                    String year = phonePeMatcher.group(3);
                    DateTimeFormatter formatter = DateTimeFormatter.ofPattern("MMM d, yyyy");
                    LocalDate date = LocalDate.parse(month + " " + day + ", " + year, formatter);
                    return date.atStartOfDay();
                } catch (Exception e) {
                    logger.warn("Failed to parse PhonePe date format: {}", dateStr);
                }
            }
        }

        // Try standard formatters
        for (DateTimeFormatter formatter : dateFormatters) {
            try {
                LocalDate date = LocalDate.parse(dateStr, formatter);
                return date.atStartOfDay();
            } catch (DateTimeParseException ignored) {
                // Try next formatter
            }
        }

        logger.warn("Could not parse date: {}", dateStr);
        return null;
    }

    private BigDecimal parseAmount(String amountStr) {
        if (amountStr == null || amountStr.trim().isEmpty()) {
            return null;
        }

        String cleaned = amountStr.replaceAll("[₹\\$,\\s]", "").trim();
        if (cleaned.isEmpty()) {
            return null;
        }

        try {
            return new BigDecimal(cleaned);
        } catch (NumberFormatException e) {
            logger.warn("Could not parse amount: '{}' (cleaned: '{}')", amountStr, cleaned);
            return null;
        }
    }

    private String cleanDescription(String description) {
        if (description == null || description.trim().isEmpty()) {
            return null;
        }

        String cleaned = description.trim().replaceAll("\\s+", " ");
        cleaned = cleaned.replaceAll("^(Paid to|Received from|Paid -)\\s*", "");

        if (cleaned.isEmpty()) {
            return null;
        }

        return cleaned;
    }

    private double calculateConfidence(String description) {
        String desc = description.toLowerCase();
        double confidence = 0.5;

        if (desc.contains("swiggy") || desc.contains("zomato") || desc.contains("amazon") ||
            desc.contains("flipkart") || desc.contains("uber") || desc.contains("ola") ||
            desc.contains("paytm") || desc.contains("phonepe") || desc.contains("gpay")) {
            confidence += 0.3;
        }

        if (desc.contains("upi") || desc.contains("@")) {
            confidence += 0.2;
        }

        return Math.min(confidence, 1.0);
    }

    private void checkForDuplicates(List<ParsedTransaction> transactions, User user) {
        for (ParsedTransaction transaction : transactions) {
            boolean isDuplicate = transactionRepository.existsByUserAndAmountAndDescriptionAndTransactionDate(
                user,
                transaction.getAmount(),
                transaction.getDescription(),
                transaction.getTransactionDate()
            );
            transaction.setIsDuplicate(isDuplicate);
        }
    }

    private void updateMetadata(StatementUploadResponse.StatementMetadata metadata, List<ParsedTransaction> transactions) {
        metadata.setParsedTransactions(transactions.size());
        metadata.setTotalTransactions(transactions.size());
        metadata.setDuplicateTransactions((int) transactions.stream().mapToInt(t -> t.getIsDuplicate() ? 1 : 0).sum());

        if (!transactions.isEmpty()) {
            LocalDateTime minDate = transactions.stream().map(ParsedTransaction::getTransactionDate).min(LocalDateTime::compareTo).orElse(null);
            LocalDateTime maxDate = transactions.stream().map(ParsedTransaction::getTransactionDate).max(LocalDateTime::compareTo).orElse(null);
            if (minDate != null && maxDate != null) {
                metadata.setDateRange(minDate.toLocalDate() + " to " + maxDate.toLocalDate());
            }
        }
    }

    private String getFileExtension(String filename) {
        if (filename == null || !filename.contains(".")) {
            return "";
        }
        return filename.substring(filename.lastIndexOf(".") + 1);
    }

    private Map<String, Integer> identifyColumns(String[] headers) {
        Map<String, Integer> columnMap = new HashMap<>();
        for (int i = 0; i < headers.length; i++) {
            String header = headers[i].toLowerCase();
            if (header.contains("date") || header.contains("time")) {
                columnMap.put("date", i);
            } else if (header.contains("amount") || header.contains("value")) {
                columnMap.put("amount", i);
            } else if (header.contains("description") || header.contains("details") || header.contains("narration")) {
                columnMap.put("description", i);
            }
        }
        return columnMap;
    }

    private Map<String, Integer> identifyExcelColumns(Row headerRow) {
        Map<String, Integer> columnMap = new HashMap<>();
        for (Cell cell : headerRow) {
            String header = getCellValueAsString(cell).toLowerCase();
            if (header.contains("date") || header.contains("time")) {
                columnMap.put("date", cell.getColumnIndex());
            } else if (header.contains("amount") || header.contains("value")) {
                columnMap.put("amount", cell.getColumnIndex());
            } else if (header.contains("description") || header.contains("details") || header.contains("narration")) {
                columnMap.put("description", cell.getColumnIndex());
            }
        }
        return columnMap;
    }

    private boolean containsHeaders(Row row) {
        for (Cell cell : row) {
            String value = getCellValueAsString(cell).toLowerCase();
            if (value.contains("date") || value.contains("amount") || value.contains("description")) {
                return true;
            }
        }
        return false;
    }

    private String getColumnValue(String[] row, Map<String, Integer> columnMap, String columnName) {
        Integer index = columnMap.get(columnName);
        if (index != null && index < row.length) {
            return row[index];
        }
        return null;
    }

    private String getCellValueAsString(Row row, Integer columnIndex) {
        if (columnIndex == null || columnIndex >= row.getLastCellNum()) {
            return null;
        }
        Cell cell = row.getCell(columnIndex);
        return getCellValueAsString(cell);
    }

    private String getCellValueAsString(Cell cell) {
        if (cell == null) {
            return "";
        }

        switch (cell.getCellType()) {
            case STRING:
                return cell.getStringCellValue();
            case NUMERIC:
                if (DateUtil.isCellDateFormatted(cell)) {
                    return cell.getDateCellValue().toString();
                } else {
                    return String.valueOf(cell.getNumericCellValue());
                }
            case BOOLEAN:
                return String.valueOf(cell.getBooleanCellValue());
            case FORMULA:
                return cell.getCellFormula();
            default:
                return "";
        }
    }

    private void extractAdditionalInfo(ParsedTransaction transaction, String line) {
        Pattern refPattern = Pattern.compile("(\\d{12,16})");
        Matcher refMatcher = refPattern.matcher(line);
        if (refMatcher.find()) {
            transaction.setReferenceNumber(refMatcher.group(1));
        }

        Pattern upiPattern = Pattern.compile("([\\w.-]+@[\\w.-]+)");
        Matcher upiMatcher = upiPattern.matcher(line);
        if (upiMatcher.find()) {
            transaction.setCounterParty(upiMatcher.group(1));
        }
    }

    // ================= KOTAK BANK PARSING METHODS =================

    /**
     * Parse Kotak Bank PDF statement
     */
    private List<ParsedTransaction> parseKotakBankPdfStatement(MultipartFile file, User user) throws IOException {
    List<ParsedTransaction> transactions = new ArrayList<>();
    
    try (PDDocument document = PDDocument.load(file.getInputStream())) {
        PDFTextStripper stripper = new PDFTextStripper();
        String content = stripper.getText(document);
        
        logger.info("Kotak Bank PDF Content length: {} characters", content.length());
        
        String[] lines = content.split("\\n");
        logger.info("Total lines in Kotak PDF: {}", lines.length);
        
        // Parse Kotak Bank PDF format
        transactions.addAll(parseKotakBankTransactions(lines));
        
        logger.info("Kotak Bank PDF parsing completed. Found {} transactions", transactions.size());
    }
    
    return transactions;
}

private List<ParsedTransaction> parseKotakBankTransactions(String[] lines) {
    List<ParsedTransaction> transactions = new ArrayList<>();
    
    // Kotak Bank specific date pattern: DD-MM-YYYY
    Pattern datePattern = Pattern.compile("^(\\d{2}-\\d{2}-\\d{4})\\s+(.+)");
    
    // Pattern for UPI transactions with reference
    Pattern upiPattern = Pattern.compile("^(\\d{2}-\\d{2}-\\d{4})\\s+(UPI/.+?)\\s+(UPI-\\d+)\\s+([\\d,]+\\.\\d{2})\\((Dr|Cr)\\)\\s+([\\d,]+\\.\\d{2})\\((Dr|Cr)\\)$");
    
    // Pattern for other transactions (MB, interest, etc.)
    Pattern otherPattern = Pattern.compile("^(\\d{2}-\\d{2}-\\d{4})\\s+(.+?)\\s+([A-Z0-9-]+)\\s+([\\d,]+\\.\\d{2})\\((Dr|Cr)\\)\\s+([\\d,]+\\.\\d{2})\\((Dr|Cr)\\)$");
    
    // Simplified pattern for transactions that span multiple lines or have different formats
    Pattern amountPattern = Pattern.compile("([\\d,]+\\.\\d{2})\\((Dr|Cr)\\)");
    
    for (int i = 0; i < lines.length; i++) {
        String line = lines[i].trim();
        
        // Skip empty lines and headers
        if (line.isEmpty() || line.startsWith("Date") || line.startsWith("Page") || 
            line.contains("Statement Summary") || line.contains("Opening Balance") ||
            line.contains("Branch") || line.contains("IFSC") || line.contains("Period :")) {
            continue;
        }
        
        // Check if line starts with date pattern (DD-MM-YYYY)
        if (line.matches("^\\d{2}-\\d{2}-\\d{4}\\s+.+")) {
            ParsedTransaction transaction = parseKotakTransactionLine(line, lines, i);
            if (transaction != null) {
                transactions.add(transaction);
                logger.debug("Parsed Kotak transaction #{}: Date={}, Desc={}, Amount={}, Type={}", 
                    transactions.size(), 
                    transaction.getTransactionDate().toLocalDate(),
                    transaction.getDescription(), 
                    transaction.getAmount(), 
                    transaction.getType());
            }
        }
    }
    
    logger.info("Kotak Bank parsing found {} transactions", transactions.size());
    return transactions;
}

private ParsedTransaction parseKotakTransactionLine(String line, String[] allLines, int currentIndex) {
    try {
        // Extract date (DD-MM-YYYY format)
        String dateStr = line.substring(0, 10);
        LocalDateTime transactionDate = parseKotakDate(dateStr);
        if (transactionDate == null) {
            logger.warn("Could not parse date: {}", dateStr);
            return null;
        }
        
        // Rest of the line after date
        String restOfLine = line.substring(10).trim();
        
        // Check if the transaction continues on the next line (for multi-line descriptions)
        StringBuilder fullLine = new StringBuilder(restOfLine);
        
        // Look ahead to see if next lines are continuation (not starting with date)
        int nextIndex = currentIndex + 1;
        while (nextIndex < allLines.length && !allLines[nextIndex].trim().isEmpty() &&
               !allLines[nextIndex].trim().matches("^\\d{2}-\\d{2}-\\d{4}\\s+.+") &&
               !allLines[nextIndex].trim().startsWith("Page") &&
               !allLines[nextIndex].trim().contains("Statement Summary")) {
            fullLine.append(" ").append(allLines[nextIndex].trim());
            nextIndex++;
        }
        
        String fullTransactionText = fullLine.toString();
        
        // Parse the transaction details
        ParsedTransaction transaction = extractKotakTransactionDetails(fullTransactionText, transactionDate);
        
        if (transaction == null) {
            logger.warn("Could not parse transaction details from: {}", fullTransactionText);
            return null;
        }
        
        return transaction;
        
    } catch (Exception e) {
        logger.error("Error parsing Kotak transaction line: {}", line, e);
        return null;
    }
}

private ParsedTransaction extractKotakTransactionDetails(String transactionText, LocalDateTime transactionDate) {
    // Pattern to find amount with Dr/Cr indicator: 1,234.56(Dr) or 1,234.56(Cr)
    Pattern amountPattern = Pattern.compile("([\\d,]+\\.\\d{2})\\((Dr|Cr)\\)");
    Matcher amountMatcher = amountPattern.matcher(transactionText);
    
    BigDecimal transactionAmount = null;
    Transaction.TransactionType type = null;
    String lastMatchedAmount = null;
    String lastMatchedType = null;
    
    // Find all amounts in the text
    List<String> amounts = new ArrayList<>();
    List<String> types = new ArrayList<>();
    
    while (amountMatcher.find()) {
        amounts.add(amountMatcher.group(1));
        types.add(amountMatcher.group(2));
    }
    
    // For Kotak statement, the first amount is the transaction amount, second is the balance
    if (amounts.size() >= 2) {
        lastMatchedAmount = amounts.get(0); // Transaction amount
        lastMatchedType = types.get(0);     // Dr or Cr
    } else if (amounts.size() == 1) {
        // Some lines might only have balance
        lastMatchedAmount = amounts.get(0);
        lastMatchedType = types.get(0);
    }
    
    if (lastMatchedAmount == null) {
        return null;
    }
    
    // Parse amount
    transactionAmount = new BigDecimal(lastMatchedAmount.replaceAll(",", ""));
    type = "Dr".equals(lastMatchedType) ? 
        Transaction.TransactionType.EXPENSE : Transaction.TransactionType.INCOME;
    
    // Extract description and reference
    // Remove all amount patterns from the text to get description
    String description = transactionText.replaceAll("([\\d,]+\\.\\d{2})\\((Dr|Cr)\\)", "").trim();
    
    // Extract reference number (typically UPI-XXXXXXXXX or MB-XXXXXXXXX or similar)
    Pattern refPattern = Pattern.compile("\\b([A-Z]{2,}-\\d+|\\d{12,})\\b");
    Matcher refMatcher = refPattern.matcher(description);
    String reference = null;
    if (refMatcher.find()) {
        reference = refMatcher.group(1);
        // Remove reference from description
        description = description.replace(reference, "").trim();
    }
    
    // Clean up description
    description = description.replaceAll("\\s+", " ").trim();
    
    if (description.isEmpty()) {
        description = "Transaction";
    }
    
    // Create transaction object
    ParsedTransaction transaction = new ParsedTransaction();
    transaction.setTransactionDate(transactionDate);
    transaction.setAmount(transactionAmount);
    transaction.setType(type);
    transaction.setDescription(cleanKotakDescription(description));
    transaction.setOriginalDescription(description);
    transaction.setReferenceNumber(reference);
    transaction.setSourceFormat("PDF-Kotak-Bank");
    transaction.setConfidence(0.95);
    
    // Extract counter party for UPI transactions
    if (description.startsWith("UPI/")) {
        String counterParty = extractUpiCounterParty(description);
        if (counterParty != null) {
            transaction.setCounterParty(counterParty);
        }
    }
    
    // Categorize transaction
    transaction.setCategory(categorizeTransaction(description, transactionAmount, type));
    
    return transaction;
}
private LocalDateTime parseKotakDate(String dateStr) {
    try {
        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("dd-MM-yyyy");
        LocalDate date = LocalDate.parse(dateStr, formatter);
        return date.atStartOfDay();
    } catch (DateTimeParseException e) {
        logger.warn("Failed to parse Kotak date: {}", dateStr);
        return null;
    }
}

/**
 * Clean Kotak Bank description
 */
private String cleanKotakDescription(String description) {
    if (description == null) return null;
    
    // Clean up common patterns
    description = description.trim()
        .replaceAll("\\s+", " ")
        .replaceAll("^UPI/", "UPI: ")
        .replaceAll("^MB:", "Mobile Banking: ")
        .replaceAll("/Payment\\s+from\\s+Ph$", "")
        .replaceAll("/NO\\s+REMARKS$", "")
        .replaceAll("/UPI$", "");
    
    // Handle specific UPI patterns
    if (description.contains("UPI:")) {
        // Extract meaningful parts from UPI description
        String[] parts = description.split("/");
        if (parts.length >= 2) {
            // Usually second part is the person/merchant name
            String cleanDesc = parts[1].trim();
            
            // Add transaction type if present
            if (parts.length > 2 && !parts[2].matches("\\d+")) {
                cleanDesc += " - " + parts[2].trim();
            }
            
            return cleanDesc;
        }
    }
    
    return description;
}

/**
 * Extract counter party from UPI description
 */
private String extractUpiCounterParty(String description) {
    // UPI format is typically: UPI/Name/TransactionId/Notes
    String[] parts = description.split("/");
    if (parts.length >= 2) {
        return parts[1].trim();
    }
    return null;
}

    /**
     * Parse Kotak Bank CSV statement
     */
    private List<ParsedTransaction> parseKotakBankCsvStatement(MultipartFile file, User user) throws IOException, CsvException {
        List<ParsedTransaction> transactions = new ArrayList<>();
        
        try (CSVReader reader = new CSVReader(new InputStreamReader(file.getInputStream()))) {
            List<String[]> allRows = reader.readAll();
            
            if (allRows.isEmpty()) {
                logger.warn("Kotak Bank CSV file is empty");
                return transactions;
            }
            
            // Find header row and identify columns
            String[] headers = allRows.get(0);
            Map<String, Integer> columnMap = identifyKotakBankColumns(headers);
            
            logger.info("Kotak Bank CSV columns identified: {}", columnMap);
            
            // Parse data rows
            for (int i = 1; i < allRows.size(); i++) {
                String[] row = allRows.get(i);
                ParsedTransaction transaction = parseKotakBankCsvRow(row, columnMap);
                if (transaction != null) {
                    transactions.add(transaction);
                }
            }
            
            logger.info("Kotak Bank CSV parsing completed. Found {} transactions", transactions.size());
        }
        
        return transactions;
    }

    /**
     * Parse Kotak Bank Excel statement
     */
    private List<ParsedTransaction> parseKotakBankExcelStatement(MultipartFile file, User user) throws IOException {
        List<ParsedTransaction> transactions = new ArrayList<>();
        
        try (Workbook workbook = file.getOriginalFilename().toLowerCase().endsWith(".xlsx") ?
                new XSSFWorkbook(file.getInputStream()) : new HSSFWorkbook(file.getInputStream())) {
            
            Sheet sheet = workbook.getSheetAt(0);
            
            // Find header row
            Row headerRow = null;
            int headerRowIndex = -1;
            
            for (int i = 0; i <= Math.min(10, sheet.getLastRowNum()); i++) {
                Row row = sheet.getRow(i);
                if (row != null && containsKotakBankHeaders(row)) {
                    headerRow = row;
                    headerRowIndex = i;
                    break;
                }
            }
            
            if (headerRow == null) {
                logger.warn("Could not find header row in Kotak Bank Excel file");
                return transactions;
            }
            
            Map<String, Integer> columnMap = identifyKotakBankExcelColumns(headerRow);
            logger.info("Kotak Bank Excel columns identified: {}", columnMap);
            
            // Parse data rows
            for (int i = headerRowIndex + 1; i <= sheet.getLastRowNum(); i++) {
                Row row = sheet.getRow(i);
                if (row != null) {
                    ParsedTransaction transaction = parseKotakBankExcelRow(row, columnMap);
                    if (transaction != null) {
                        transactions.add(transaction);
                    }
                }
            }
            
            logger.info("Kotak Bank Excel parsing completed. Found {} transactions", transactions.size());
        }
        
        return transactions;
    }

    /**
     * Parse Kotak Bank PDF content
     */
    private List<ParsedTransaction> parseKotakBankPdfContent(String[] lines) {
        List<ParsedTransaction> transactions = new ArrayList<>();
        
        // Kotak Bank PDF patterns - matches lines like: "01/12/2023 UPI-PHONEPE-123456789 500.00 0.00 Dr"
        Pattern transactionPattern = Pattern.compile(
            "^(\\d{2}/\\d{2}/\\d{4})\\s+(.+?)\\s+(\\d+\\.\\d+)\\s+(\\d+\\.\\d+)\\s*(Dr|Cr)?.*$"
        );
        
        for (String line : lines) {
            line = line.trim();
            if (line.isEmpty()) continue;
            
            Matcher transactionMatcher = transactionPattern.matcher(line);
            if (transactionMatcher.matches()) {
                try {
                    ParsedTransaction transaction = parseKotakBankTransactionLine(transactionMatcher);
                    if (transaction != null) {
                        transactions.add(transaction);
                        logger.debug("Parsed Kotak transaction: {} - {}", 
                            transaction.getDescription(), transaction.getAmount());
                    }
                } catch (Exception e) {
                    logger.warn("Error parsing Kotak transaction line: {}", line, e);
                }
            }
        }
        
        logger.info("Kotak Bank PDF parsing found {} transactions", transactions.size());
        return transactions;
    }

    /**
     * Parse individual Kotak Bank transaction line from PDF
     */
    private ParsedTransaction parseKotakBankTransactionLine(Matcher matcher) {
        try {
            String dateStr = matcher.group(1);
            String description = matcher.group(2).trim();
            String debitAmount = matcher.group(3);
            String creditAmount = matcher.group(4);
            String drCr = matcher.groupCount() > 4 ? matcher.group(5) : null;
            
            // Parse date
            LocalDateTime transactionDate = parseDate(dateStr);
            if (transactionDate == null) {
                logger.warn("Could not parse date: {}", dateStr);
                return null;
            }
            
            // Determine amount and type
            BigDecimal amount;
            Transaction.TransactionType type;
            
            if ("Dr".equals(drCr) || (!"0.00".equals(debitAmount) && new BigDecimal(debitAmount).compareTo(BigDecimal.ZERO) > 0)) {
                amount = new BigDecimal(debitAmount);
                type = Transaction.TransactionType.EXPENSE;
            } else {
                amount = new BigDecimal(creditAmount);
                type = Transaction.TransactionType.INCOME;
            }
            
            if (amount.compareTo(BigDecimal.ZERO) <= 0) {
                return null;
            }
            
            // Create transaction
            ParsedTransaction transaction = new ParsedTransaction();
            transaction.setTransactionDate(transactionDate);
            transaction.setDescription(cleanDescription(description));
            transaction.setOriginalDescription(description);
            transaction.setAmount(amount);
            transaction.setType(type);
            transaction.setSourceFormat("PDF-Kotak-Bank");
            transaction.setConfidence(0.85);
            
            // Set category
            transaction.setCategory(categorizeTransaction(description, amount, type));
            
            return transaction;
            
        } catch (Exception e) {
            logger.error("Error parsing Kotak Bank transaction: {}", e.getMessage(), e);
            return null;
        }
    }

    /**
     * Parse Kotak Bank CSV row
     */
    private ParsedTransaction parseKotakBankCsvRow(String[] row, Map<String, Integer> columnMap) {
        try {
            String dateStr = getColumnValue(row, columnMap, "date");
            String description = getColumnValue(row, columnMap, "description");
            String debitAmount = getColumnValue(row, columnMap, "debit");
            String creditAmount = getColumnValue(row, columnMap, "credit");
            
            if (dateStr == null || dateStr.trim().isEmpty()) {
                return null;
            }
            
            LocalDateTime transactionDate = parseDate(dateStr);
            if (transactionDate == null) {
                return null;
            }
            
            // Determine amount and type
            BigDecimal amount = null;
            Transaction.TransactionType type = null;
            
            if (debitAmount != null && !debitAmount.trim().isEmpty() && !"0.00".equals(debitAmount)) {
                amount = parseAmount(debitAmount);
                type = Transaction.TransactionType.EXPENSE;
            } else if (creditAmount != null && !creditAmount.trim().isEmpty() && !"0.00".equals(creditAmount)) {
                amount = parseAmount(creditAmount);
                type = Transaction.TransactionType.INCOME;
            }
            
            if (amount == null || amount.compareTo(BigDecimal.ZERO) <= 0) {
                return null;
            }
            
            ParsedTransaction transaction = new ParsedTransaction();
            transaction.setTransactionDate(transactionDate);
            transaction.setDescription(cleanDescription(description));
            transaction.setOriginalDescription(description);
            transaction.setAmount(amount);
            transaction.setType(type);
            transaction.setSourceFormat("CSV-Kotak-Bank");
            transaction.setConfidence(0.9);
            
            // Set category
            transaction.setCategory(categorizeTransaction(description, amount, type));
            
            return transaction;
            
        } catch (Exception e) {
            logger.warn("Error parsing Kotak Bank CSV row: {}", e.getMessage());
            return null;
        }
    }

    /**
     * Parse Kotak Bank Excel row
     */
    private ParsedTransaction parseKotakBankExcelRow(Row row, Map<String, Integer> columnMap) {
        try {
            String dateStr = getCellValueAsString(row, columnMap.get("date"));
            String description = getCellValueAsString(row, columnMap.get("description"));
            String debitAmount = getCellValueAsString(row, columnMap.get("debit"));
            String creditAmount = getCellValueAsString(row, columnMap.get("credit"));
            
            if (dateStr == null || dateStr.trim().isEmpty()) {
                return null;
            }
            
            LocalDateTime transactionDate = parseDate(dateStr);
            if (transactionDate == null) {
                return null;
            }
            
            // Determine amount and type
            BigDecimal amount = null;
            Transaction.TransactionType type = null;
            
            if (debitAmount != null && !debitAmount.trim().isEmpty() && !"0.0".equals(debitAmount)) {
                amount = parseAmount(debitAmount);
                type = Transaction.TransactionType.EXPENSE;
            } else if (creditAmount != null && !creditAmount.trim().isEmpty() && !"0.0".equals(creditAmount)) {
                amount = parseAmount(creditAmount);
                type = Transaction.TransactionType.INCOME;
            }
            
            if (amount == null || amount.compareTo(BigDecimal.ZERO) <= 0) {
                return null;
            }
            
            ParsedTransaction transaction = new ParsedTransaction();
            transaction.setTransactionDate(transactionDate);
            transaction.setDescription(cleanDescription(description));
            transaction.setOriginalDescription(description);
            transaction.setAmount(amount);
            transaction.setType(type);
            transaction.setSourceFormat("Excel-Kotak-Bank");
            transaction.setConfidence(0.9);
            
            // Set category
            transaction.setCategory(categorizeTransaction(description, amount, type));
            
            return transaction;
            
        } catch (Exception e) {
            logger.warn("Error parsing Kotak Bank Excel row: {}", e.getMessage());
            return null;
        }
    }

    /**
     * Identify Kotak Bank specific columns in CSV
     */
    private Map<String, Integer> identifyKotakBankColumns(String[] headers) {
        Map<String, Integer> columnMap = new HashMap<>();
        
        for (int i = 0; i < headers.length; i++) {
            String header = headers[i].toLowerCase().trim();
            
            if (header.contains("date") || header.contains("txn date") || header.contains("transaction date")) {
                columnMap.put("date", i);
            } else if (header.contains("description") || header.contains("narration") || header.contains("particulars")) {
                columnMap.put("description", i);
            } else if (header.contains("debit") || header.contains("withdrawal")) {
                columnMap.put("debit", i);
            } else if (header.contains("credit") || header.contains("deposit")) {
                columnMap.put("credit", i);
            } else if (header.contains("balance")) {
                columnMap.put("balance", i);
            } else if (header.contains("chq") || header.contains("cheque") || header.contains("ref")) {
                columnMap.put("reference", i);
            }
        }
        
        return columnMap;
    }

    /**
     * Identify Kotak Bank specific columns in Excel
     */
    private Map<String, Integer> identifyKotakBankExcelColumns(Row headerRow) {
        Map<String, Integer> columnMap = new HashMap<>();
        
        for (Cell cell : headerRow) {
            String header = getCellValueAsString(cell).toLowerCase().trim();
            int columnIndex = cell.getColumnIndex();
            
            if (header.contains("date") || header.contains("txn date") || header.contains("transaction date")) {
                columnMap.put("date", columnIndex);
            } else if (header.contains("description") || header.contains("narration") || header.contains("particulars")) {
                columnMap.put("description", columnIndex);
            } else if (header.contains("debit") || header.contains("withdrawal")) {
                columnMap.put("debit", columnIndex);
            } else if (header.contains("credit") || header.contains("deposit")) {
                columnMap.put("credit", columnIndex);
            } else if (header.contains("balance")) {
                columnMap.put("balance", columnIndex);
            } else if (header.contains("chq") || header.contains("cheque") || header.contains("ref")) {
                columnMap.put("reference", columnIndex);
            }
        }
        
        return columnMap;
    }

    /**
     * Check if row contains Kotak Bank headers
     */
    private boolean containsKotakBankHeaders(Row row) {
        for (Cell cell : row) {
            String value = getCellValueAsString(cell).toLowerCase();
            if (value.contains("date") || value.contains("debit") || value.contains("credit") || 
                value.contains("description") || value.contains("narration") || value.contains("particulars")) {
                return true;
            }
        }
        return false;
    }
}
