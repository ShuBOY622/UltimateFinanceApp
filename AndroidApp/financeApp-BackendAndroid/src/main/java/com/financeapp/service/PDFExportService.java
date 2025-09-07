package com.financeapp.service;

import com.financeapp.model.Transaction;
import com.financeapp.model.User;
import org.apache.pdfbox.pdmodel.PDDocument;
import org.apache.pdfbox.pdmodel.PDPage;
import org.apache.pdfbox.pdmodel.PDPageContentStream;
import org.apache.pdfbox.pdmodel.font.PDType1Font;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.Map;

@Service
public class PDFExportService {

    @Autowired
    private TransactionService transactionService;

    public byte[] generateTransactionReport(User user, LocalDateTime startDate, LocalDateTime endDate) {
        try {
            PDDocument document = new PDDocument();
            PDPage page = new PDPage();
            document.addPage(page);

            PDPageContentStream contentStream = new PDPageContentStream(document, page);
            
            // Title
            contentStream.beginText();
            contentStream.setFont(PDType1Font.HELVETICA_BOLD, 20);
            contentStream.newLineAtOffset(200, 750);
            contentStream.showText("Transaction Report");
            contentStream.endText();

            // User info
            contentStream.beginText();
            contentStream.setFont(PDType1Font.HELVETICA, 12);
            contentStream.newLineAtOffset(50, 700);
            contentStream.showText("User: " + user.getFirstName() + " " + user.getLastName());
            contentStream.newLineAtOffset(0, -20);
            contentStream.showText("Email: " + user.getEmail());
            contentStream.newLineAtOffset(0, -20);
            contentStream.showText("Report Period: " + 
                    startDate.format(DateTimeFormatter.ofPattern("yyyy-MM-dd")) + " to " +
                    endDate.format(DateTimeFormatter.ofPattern("yyyy-MM-dd")));
            contentStream.endText();

            // Financial Summary
            Map<String, Object> summary = transactionService.getFinancialSummary(user);
            
            contentStream.beginText();
            contentStream.setFont(PDType1Font.HELVETICA_BOLD, 14);
            contentStream.newLineAtOffset(50, 620);
            contentStream.showText("Financial Summary");
            contentStream.endText();

            contentStream.beginText();
            contentStream.setFont(PDType1Font.HELVETICA, 12);
            contentStream.newLineAtOffset(50, 590);
            contentStream.showText("Total Income: $" + summary.get("totalIncome"));
            contentStream.newLineAtOffset(0, -20);
            contentStream.showText("Total Expenses: $" + summary.get("totalExpenses"));
            contentStream.newLineAtOffset(0, -20);
            contentStream.showText("Net Balance: $" + summary.get("netBalance"));
            contentStream.endText();

            // Transactions
            List<Transaction> transactions = transactionService.getUserTransactionsByDateRange(user, startDate, endDate);
            
            contentStream.beginText();
            contentStream.setFont(PDType1Font.HELVETICA_BOLD, 14);
            contentStream.newLineAtOffset(50, 500);
            contentStream.showText("Recent Transactions");
            contentStream.endText();

            // Transaction headers
            contentStream.beginText();
            contentStream.setFont(PDType1Font.HELVETICA_BOLD, 10);
            contentStream.newLineAtOffset(50, 470);
            contentStream.showText("Date");
            contentStream.newLineAtOffset(80, 0);
            contentStream.showText("Description");
            contentStream.newLineAtOffset(150, 0);
            contentStream.showText("Category");
            contentStream.newLineAtOffset(100, 0);
            contentStream.showText("Type");
            contentStream.newLineAtOffset(80, 0);
            contentStream.showText("Amount");
            contentStream.endText();

            // Transaction data
            int yPosition = 450;
            int count = 0;
            for (Transaction transaction : transactions) {
                if (count >= 15) break; // Limit to prevent overflow
                
                contentStream.beginText();
                contentStream.setFont(PDType1Font.HELVETICA, 9);
                contentStream.newLineAtOffset(50, yPosition);
                contentStream.showText(transaction.getTransactionDate().format(DateTimeFormatter.ofPattern("MM/dd")));
                contentStream.newLineAtOffset(80, 0);
                String desc = transaction.getDescription();
                if (desc.length() > 20) desc = desc.substring(0, 17) + "...";
                contentStream.showText(desc);
                contentStream.newLineAtOffset(150, 0);
                contentStream.showText(transaction.getCategory().toString().substring(0, Math.min(10, transaction.getCategory().toString().length())));
                contentStream.newLineAtOffset(100, 0);
                contentStream.showText(transaction.getType().toString());
                contentStream.newLineAtOffset(80, 0);
                contentStream.showText("$" + transaction.getAmount());
                contentStream.endText();
                
                yPosition -= 15;
                count++;
            }

            contentStream.close();

            ByteArrayOutputStream baos = new ByteArrayOutputStream();
            document.save(baos);
            document.close();

            return baos.toByteArray();
        } catch (IOException e) {
            throw new RuntimeException("Error generating PDF report", e);
        }
    }

    public byte[] generateFinancialSummaryReport(User user) {
        try {
            PDDocument document = new PDDocument();
            PDPage page = new PDPage();
            document.addPage(page);

            PDPageContentStream contentStream = new PDPageContentStream(document, page);
            
            // Title
            contentStream.beginText();
            contentStream.setFont(PDType1Font.HELVETICA_BOLD, 20);
            contentStream.newLineAtOffset(150, 750);
            contentStream.showText("Financial Summary Report");
            contentStream.endText();

            // User info
            contentStream.beginText();
            contentStream.setFont(PDType1Font.HELVETICA, 12);
            contentStream.newLineAtOffset(50, 700);
            contentStream.showText("User: " + user.getFirstName() + " " + user.getLastName());
            contentStream.newLineAtOffset(0, -20);
            contentStream.showText("Generated on: " + 
                    LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm")));
            contentStream.endText();

            // Financial Summary
            Map<String, Object> summary = transactionService.getFinancialSummary(user);
            
            // Overall Summary
            contentStream.beginText();
            contentStream.setFont(PDType1Font.HELVETICA_BOLD, 14);
            contentStream.newLineAtOffset(50, 620);
            contentStream.showText("Overall Financial Summary");
            contentStream.endText();

            contentStream.beginText();
            contentStream.setFont(PDType1Font.HELVETICA, 12);
            contentStream.newLineAtOffset(50, 590);
            contentStream.showText("Total Income: $" + summary.get("totalIncome"));
            contentStream.newLineAtOffset(0, -20);
            contentStream.showText("Total Expenses: $" + summary.get("totalExpenses"));
            contentStream.newLineAtOffset(0, -20);
            contentStream.showText("Net Balance: $" + summary.get("netBalance"));
            contentStream.newLineAtOffset(0, -20);
            contentStream.showText("Reward Points: " + user.getRewardPoints());
            contentStream.endText();

            // Monthly Summary
            contentStream.beginText();
            contentStream.setFont(PDType1Font.HELVETICA_BOLD, 14);
            contentStream.newLineAtOffset(50, 480);
            contentStream.showText("Current Month Summary");
            contentStream.endText();

            contentStream.beginText();
            contentStream.setFont(PDType1Font.HELVETICA, 12);
            contentStream.newLineAtOffset(50, 450);
            contentStream.showText("Monthly Income: $" + summary.get("monthlyIncome"));
            contentStream.newLineAtOffset(0, -20);
            contentStream.showText("Monthly Expenses: $" + summary.get("monthlyExpenses"));
            contentStream.newLineAtOffset(0, -20);
            contentStream.showText("Monthly Balance: $" + summary.get("monthlyBalance"));
            contentStream.endText();

            // Budget Information
            if (user.getMonthlyBudget().compareTo(BigDecimal.ZERO) > 0) {
                contentStream.beginText();
                contentStream.setFont(PDType1Font.HELVETICA_BOLD, 14);
                contentStream.newLineAtOffset(50, 340);
                contentStream.showText("Budget Information");
                contentStream.endText();

                contentStream.beginText();
                contentStream.setFont(PDType1Font.HELVETICA, 12);
                contentStream.newLineAtOffset(50, 310);
                contentStream.showText("Monthly Budget: $" + user.getMonthlyBudget());
                contentStream.newLineAtOffset(0, -20);
                contentStream.showText("Daily Budget: $" + user.getDailyBudget());
                contentStream.endText();
            }

            contentStream.close();

            ByteArrayOutputStream baos = new ByteArrayOutputStream();
            document.save(baos);
            document.close();

            return baos.toByteArray();
        } catch (IOException e) {
            throw new RuntimeException("Error generating financial summary PDF", e);
        }
    }
}