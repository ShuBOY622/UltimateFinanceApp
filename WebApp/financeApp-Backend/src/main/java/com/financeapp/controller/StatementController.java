package com.financeapp.controller;

import com.financeapp.dto.ParsedTransaction;
import com.financeapp.dto.StatementUploadResponse;
import com.financeapp.model.Transaction;
import com.financeapp.model.User;
import com.financeapp.service.StatementParsingService;
import com.financeapp.service.TransactionService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import jakarta.validation.Valid;
import jakarta.servlet.http.HttpServletRequest;
import java.time.LocalDateTime;
import java.util.List;
import java.util.ArrayList;
import java.util.Map;
import java.util.Arrays;

/**
 * Controller for handling statement file uploads and parsing
 */
@CrossOrigin(origins = "*", maxAge = 3600)
@RestController
@RequestMapping("/api/statements")
public class StatementController {

    private static final Logger logger = LoggerFactory.getLogger(StatementController.class);

    @Autowired
    private StatementParsingService statementParsingService;

    @Autowired
    private TransactionService transactionService;

    /**
     * Upload and parse statement file
     */
    @PostMapping("/upload")
    public ResponseEntity<StatementUploadResponse> uploadStatement(
            @RequestParam("file") MultipartFile file,
            @RequestParam(value = "format", required = false) String format,
            @RequestParam(value = "statementType", required = false, defaultValue = "PHONEPE") String statementType,
            Authentication authentication,
            HttpServletRequest request) {
        
        try {
            // Debug logging for all parameters
            logger.debug("🔍 Upload request parameters:");
            logger.debug("  file: {} (size: {})", file.getOriginalFilename(), file.getSize());
            logger.debug("  format: '{}'", format);
            logger.debug("  statementType: '{}'", statementType);
            
            // Log all request parameters for debugging
            Map<String, String[]> paramMap = request.getParameterMap();
            logger.debug("  All request parameters:");
            for (Map.Entry<String, String[]> entry : paramMap.entrySet()) {
                logger.debug("    {}: {}", entry.getKey(), Arrays.toString(entry.getValue()));
            }
            // Validate user authentication
            if (authentication == null || !(authentication.getPrincipal() instanceof User)) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(StatementUploadResponse.error("User not authenticated"));
            }

            User user = (User) authentication.getPrincipal();
            
            // Validate file
            if (file.isEmpty()) {
                return ResponseEntity.badRequest()
                    .body(StatementUploadResponse.error("Please select a file to upload"));
            }

            // Validate file size (max 10MB)
            if (file.getSize() > 10 * 1024 * 1024) {
                return ResponseEntity.badRequest()
                    .body(StatementUploadResponse.error("File size must be less than 10MB"));
            }

            // Validate file type
            String originalFilename = file.getOriginalFilename();
            if (originalFilename == null || !isValidFileType(originalFilename)) {
                return ResponseEntity.badRequest()
                    .body(StatementUploadResponse.error("Unsupported file type. Please upload PDF, CSV, HTML, or Excel files"));
            }

            logger.info("Processing statement upload for user: {} with file: {} (type: {})", 
                       user.getEmail(), originalFilename, statementType);
            logger.debug("Raw statementType parameter received: '{}'", statementType);
            logger.debug("File details - Name: {}, Size: {}, ContentType: {}", 
                        originalFilename, file.getSize(), file.getContentType());

            // Parse the statement
            StatementUploadResponse response = statementParsingService.parseStatement(file, user, statementType);
            
            if (response.isSuccess()) {
                logger.info("Successfully parsed {} transactions from file: {}", 
                           response.getTransactions().size(), originalFilename);
            } else {
                logger.warn("Failed to parse statement file: {} - {}", originalFilename, response.getMessage());
            }

            return ResponseEntity.ok(response);

        } catch (Exception e) {
            logger.error("Error processing statement upload", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(StatementUploadResponse.error("Internal server error: " + e.getMessage()));
        }
    }

    /**
     * Import parsed transactions into the database
     */
    @PostMapping("/import")
    public ResponseEntity<ImportResponse> importTransactions(
            @Valid @RequestBody ImportRequest request,
            Authentication authentication) {
        
        try {
            // Validate user authentication
            if (authentication == null || !(authentication.getPrincipal() instanceof User)) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(new ImportResponse(false, "User not authenticated", 0, 0));
            }

            User user = (User) authentication.getPrincipal();
            
            if (request.getTransactions() == null || request.getTransactions().isEmpty()) {
                return ResponseEntity.badRequest()
                    .body(new ImportResponse(false, "No transactions to import", 0, 0));
            }

            logger.info("Importing {} transactions for user: {}", 
                       request.getTransactions().size(), user.getEmail());

            int successCount = 0;
            int errorCount = 0;
            List<String> errors = new ArrayList<>();

            // Import each transaction
            for (ParsedTransaction parsedTransaction : request.getTransactions()) {
                try {
                    // Skip duplicates if requested
                    if (request.isSkipDuplicates() && Boolean.TRUE.equals(parsedTransaction.getIsDuplicate())) {
                        continue;
                    }

                    // Update transaction date to current month if requested
                    if (request.isUpdateDatesToCurrentMonth()) {
                        LocalDateTime originalDate = parsedTransaction.getTransactionDate();
                        if (originalDate != null) {
                            // Keep the day and time, but update to current month/year
                            LocalDateTime now = LocalDateTime.now();
                            LocalDateTime updatedDate = now.withDayOfMonth(
                                Math.min(originalDate.getDayOfMonth(), now.toLocalDate().lengthOfMonth())
                            ).withHour(originalDate.getHour()).withMinute(originalDate.getMinute());
                            
                            parsedTransaction.setTransactionDate(updatedDate);
                            logger.debug("Updated transaction date from {} to {} for transaction: {}", 
                                originalDate, updatedDate, parsedTransaction.getDescription());
                        }
                    }

                    // Convert to Transaction entity and save
                    Transaction transaction = parsedTransaction.toTransaction();
                    transaction.setUser(user);
                    
                    transactionService.createTransaction(transaction, user);
                    successCount++;
                    
                } catch (Exception e) {
                    errorCount++;
                    errors.add("Failed to import transaction: " + parsedTransaction.getDescription() + " - " + e.getMessage());
                    logger.warn("Failed to import transaction: {}", parsedTransaction.getDescription(), e);
                }
            }

            String message = String.format("Import completed: %d successful, %d failed", successCount, errorCount);
            
            ImportResponse response = new ImportResponse(true, message, successCount, errorCount);
            response.setErrors(errors);

            logger.info("Import completed for user: {} - {} successful, {} failed", 
                       user.getEmail(), successCount, errorCount);

            return ResponseEntity.ok(response);

        } catch (Exception e) {
            logger.error("Error importing transactions", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(new ImportResponse(false, "Internal server error: " + e.getMessage(), 0, 0));
        }
    }

    /**
     * Get supported file formats
     */
    @GetMapping("/formats")
    public ResponseEntity<List<FileFormatInfo>> getSupportedFormats() {
        List<FileFormatInfo> formats = List.of(
            new FileFormatInfo("PDF", "pdf", "Bank statements, UPI transaction reports, Kotak Bank statements"),
            new FileFormatInfo("CSV", "csv", "Comma-separated values from apps like GPay, PhonePe, Kotak Bank exports"),
            new FileFormatInfo("Excel", "xlsx,xls", "Excel spreadsheets with transaction data from banks and UPI apps"),
            new FileFormatInfo("HTML", "html,htm", "Web-based transaction reports")
        );
        
        return ResponseEntity.ok(formats);
    }

    /**
     * Get supported statement types
     */
    @GetMapping("/statement-types")
    public ResponseEntity<List<StatementTypeInfo>> getSupportedStatementTypes() {
        List<StatementTypeInfo> statementTypes = List.of(
            new StatementTypeInfo("PHONEPE", "PhonePe", "PhonePe UPI transaction statements", true, List.of("PDF", "CSV", "Excel", "HTML")),
            new StatementTypeInfo("KOTAK_BANK", "Kotak Mahindra Bank", "Kotak Bank account statements with comprehensive transaction parsing", true, List.of("PDF", "CSV", "Excel")),
            new StatementTypeInfo("GOOGLEPAY", "Google Pay", "Google Pay transaction reports (Coming Soon)", false, List.of("PDF", "CSV")),
            new StatementTypeInfo("BHIM_UPI", "BHIM UPI", "BHIM UPI transaction statements (Coming Soon)", false, List.of("PDF", "CSV")),
            new StatementTypeInfo("PAYTM", "Paytm", "Paytm wallet and UPI transactions (Coming Soon)", false, List.of("PDF", "CSV")),
            new StatementTypeInfo("BANK_STATEMENT", "Generic Bank Statement", "Generic bank statements (Coming Soon)", false, List.of("PDF", "CSV", "Excel"))
        );
        
        return ResponseEntity.ok(statementTypes);
    }

    /**
     * Update old transaction dates to current month
     * Useful for transactions imported from old statements that have outdated dates
     */
    @PostMapping("/update-dates")
    public ResponseEntity<?> updateTransactionDatesToCurrentMonth(Authentication authentication) {
        try {
            if (authentication == null || !(authentication.getPrincipal() instanceof User)) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body("User not authenticated");
            }

            User user = (User) authentication.getPrincipal();
            
            // Get all transactions for the user
            List<Transaction> allTransactions = transactionService.getUserTransactions(user);
            
            // Filter transactions older than current year (likely from imported statements)
            LocalDateTime currentYear = LocalDateTime.now().withDayOfYear(1).withHour(0).withMinute(0).withSecond(0);
            List<Transaction> oldTransactions = allTransactions.stream()
                .filter(t -> t.getTransactionDate().isBefore(currentYear))
                .toList();
            
            if (oldTransactions.isEmpty()) {
                return ResponseEntity.ok("No old transactions found to update");
            }
            
            int updatedCount = 0;
            LocalDateTime now = LocalDateTime.now();
            
            for (Transaction transaction : oldTransactions) {
                LocalDateTime originalDate = transaction.getTransactionDate();
                // Keep the day and time, but update to current month/year
                LocalDateTime updatedDate = now.withDayOfMonth(
                    Math.min(originalDate.getDayOfMonth(), now.toLocalDate().lengthOfMonth())
                ).withHour(originalDate.getHour()).withMinute(originalDate.getMinute());
                
                transaction.setTransactionDate(updatedDate);
                transactionService.updateTransaction(transaction.getId(), transaction, user);
                updatedCount++;
                
                logger.debug("Updated transaction date from {} to {} for: {}", 
                    originalDate, updatedDate, transaction.getDescription());
            }
            
            logger.info("Updated {} transaction dates to current month for user: {}", 
                updatedCount, user.getEmail());
            
            return ResponseEntity.ok(String.format("Successfully updated %d transaction dates to current month", updatedCount));
            
        } catch (Exception e) {
            logger.error("Error updating transaction dates", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body("Internal server error: " + e.getMessage());
        }
    }

    /**
     * Validate file type
     */
    private boolean isValidFileType(String filename) {
        String extension = filename.toLowerCase().substring(filename.lastIndexOf(".") + 1);
        return List.of("pdf", "csv", "xlsx", "xls", "html", "htm").contains(extension);
    }

    /**
     * Request DTO for importing transactions
     */
    public static class ImportRequest {
        private List<ParsedTransaction> transactions;
        private boolean skipDuplicates = true;
        private boolean updateDatesToCurrentMonth = false; // New option to update old dates

        // Constructors
        public ImportRequest() {}

        public ImportRequest(List<ParsedTransaction> transactions, boolean skipDuplicates) {
            this.transactions = transactions;
            this.skipDuplicates = skipDuplicates;
        }

        public ImportRequest(List<ParsedTransaction> transactions, boolean skipDuplicates, boolean updateDatesToCurrentMonth) {
            this.transactions = transactions;
            this.skipDuplicates = skipDuplicates;
            this.updateDatesToCurrentMonth = updateDatesToCurrentMonth;
        }

        // Getters and Setters
        public List<ParsedTransaction> getTransactions() {
            return transactions;
        }

        public void setTransactions(List<ParsedTransaction> transactions) {
            this.transactions = transactions;
        }

        public boolean isSkipDuplicates() {
            return skipDuplicates;
        }

        public void setSkipDuplicates(boolean skipDuplicates) {
            this.skipDuplicates = skipDuplicates;
        }

        public boolean isUpdateDatesToCurrentMonth() {
            return updateDatesToCurrentMonth;
        }

        public void setUpdateDatesToCurrentMonth(boolean updateDatesToCurrentMonth) {
            this.updateDatesToCurrentMonth = updateDatesToCurrentMonth;
        }
    }

    /**
     * Response DTO for import operation
     */
    public static class ImportResponse {
        private boolean success;
        private String message;
        private int successCount;
        private int errorCount;
        private List<String> errors;

        // Constructors
        public ImportResponse() {
            this.errors = new ArrayList<>();
        }

        public ImportResponse(boolean success, String message, int successCount, int errorCount) {
            this();
            this.success = success;
            this.message = message;
            this.successCount = successCount;
            this.errorCount = errorCount;
        }

        // Getters and Setters
        public boolean isSuccess() {
            return success;
        }

        public void setSuccess(boolean success) {
            this.success = success;
        }

        public String getMessage() {
            return message;
        }

        public void setMessage(String message) {
            this.message = message;
        }

        public int getSuccessCount() {
            return successCount;
        }

        public void setSuccessCount(int successCount) {
            this.successCount = successCount;
        }

        public int getErrorCount() {
            return errorCount;
        }

        public void setErrorCount(int errorCount) {
            this.errorCount = errorCount;
        }

        public List<String> getErrors() {
            return errors;
        }

        public void setErrors(List<String> errors) {
            this.errors = errors;
        }
    }

    /**
     * File format information DTO
     */
    public static class FileFormatInfo {
        private String name;
        private String extensions;
        private String description;

        // Constructor
        public FileFormatInfo(String name, String extensions, String description) {
            this.name = name;
            this.extensions = extensions;
            this.description = description;
        }

        // Getters and Setters
        public String getName() {
            return name;
        }

        public void setName(String name) {
            this.name = name;
        }

        public String getExtensions() {
            return extensions;
        }

        public void setExtensions(String extensions) {
            this.extensions = extensions;
        }

        public String getDescription() {
            return description;
        }

        public void setDescription(String description) {
            this.description = description;
        }
    }

    /**
     * Statement type information DTO
     */
    public static class StatementTypeInfo {
        private String value;
        private String label;
        private String description;
        private boolean supported;
        private List<String> supportedFormats;

        // Constructor
        public StatementTypeInfo(String value, String label, String description, boolean supported, List<String> supportedFormats) {
            this.value = value;
            this.label = label;
            this.description = description;
            this.supported = supported;
            this.supportedFormats = supportedFormats;
        }

        // Getters and Setters
        public String getValue() {
            return value;
        }

        public void setValue(String value) {
            this.value = value;
        }

        public String getLabel() {
            return label;
        }

        public void setLabel(String label) {
            this.label = label;
        }

        public String getDescription() {
            return description;
        }

        public void setDescription(String description) {
            this.description = description;
        }

        public boolean isSupported() {
            return supported;
        }

        public void setSupported(boolean supported) {
            this.supported = supported;
        }

        public List<String> getSupportedFormats() {
            return supportedFormats;
        }

        public void setSupportedFormats(List<String> supportedFormats) {
            this.supportedFormats = supportedFormats;
        }
    }
}