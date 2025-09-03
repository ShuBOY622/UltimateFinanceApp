# Kotak Bank Statement Parsing Guide

## Overview

The Finora now supports comprehensive parsing of Kotak Mahindra Bank statements in multiple formats (PDF, CSV, Excel). This feature allows users to automatically import their bank transactions with accurate categorization and duplicate detection.

## Supported Features

### 🏦 **Kotak Bank Statement Support**
- **PDF Statements**: Complete transaction parsing from bank-generated PDFs
- **CSV Exports**: Support for Kotak Bank CSV transaction exports 
- **Excel Files**: Full parsing of .xlsx and .xls statement files
- **Automatic Categorization**: Smart transaction categorization based on description
- **Duplicate Detection**: Prevents duplicate transactions during import
- **Date Range Support**: Handles various date formats used by Kotak Bank

### 📱 **Enhanced UI Experience**
- **Statement Type Selection**: Easy selection between PhonePe, Kotak Bank, and other providers
- **Visual Format Indicators**: Clear display of supported formats for each statement type
- **Progress Tracking**: Real-time upload and parsing progress
- **Preview Functionality**: Review transactions before importing
- **Error Handling**: Comprehensive error messages and recovery suggestions

## How to Use

### Step 1: Access Statement Upload
1. Navigate to the "Statements" section in the Finora
2. Click on "Upload Statement" or drag & drop your file

### Step 2: Select Statement Type
1. Choose **"Kotak Mahindra Bank"** from the statement type options
2. Note the supported formats: PDF, CSV, Excel
3. See the format icons and descriptions for guidance

### Step 3: Upload Your Statement
1. **Drag & drop** your Kotak Bank statement file, or
2. **Click to browse** and select the file
3. Supported file types:
   - `.pdf` - Bank-generated PDF statements
   - `.csv` - CSV export from Kotak online banking
   - `.xlsx/.xls` - Excel downloads from Kotak mobile app

### Step 4: Review Parsed Transactions
1. Wait for parsing to complete (progress bar shows status)
2. Review the parsed transactions in the preview dialog
3. Check for duplicates (marked with warning indicators)
4. Verify transaction categorization and amounts

### Step 5: Import Transactions
1. Click "Import Transactions" to add to your account
2. Choose whether to skip duplicate transactions
3. Receive confirmation of successful imports

## Supported Transaction Formats

### PDF Statement Parsing
- **Date Format**: DD/MM/YYYY (e.g., 01/12/2023)
- **Transaction Pattern**: Date + Description + Debit + Credit + Balance
- **Amount Detection**: Automatic debit/credit identification
- **Description Cleaning**: Removes bank codes and formatting

### CSV Statement Parsing
- **Headers Supported**:
  - Date, Transaction Date, Txn Date
  - Description, Narration, Particulars
  - Debit, Withdrawal
  - Credit, Deposit
  - Balance
  - Reference, Cheque No, CHQ No

### Excel Statement Parsing
- **Auto Header Detection**: Finds header row automatically
- **Multiple Sheets**: Processes first sheet by default
- **Format Support**: Both .xlsx (Excel 2007+) and .xls (Excel 97-2003)

## Transaction Categorization

The system automatically categorizes transactions based on keywords in descriptions:

- **FOOD**: Swiggy, Zomato, restaurant names
- **TRANSPORTATION**: Uber, Ola, fuel, petrol
- **SHOPPING**: Amazon, Flipkart, shopping keywords
- **ENTERTAINMENT**: Netflix, movie, entertainment
- **UTILITIES**: electricity, water, gas, telecom
- **HEALTHCARE**: medical, pharmacy, hospital
- **EDUCATION**: school, college, course fees
- **RENT**: rent, lease payments
- **OTHER_EXPENSE/OTHER_INCOME**: Fallback categories

## Error Handling & Troubleshooting

### Common Issues and Solutions

#### "No transactions found"
- **Cause**: File format not recognized or empty file
- **Solution**: Ensure file is a valid Kotak Bank statement in PDF, CSV, or Excel format

#### "Duplicate transactions detected"
- **Cause**: Transactions already exist in your account
- **Solution**: Choose to skip duplicates during import, or review and import only new transactions

#### "Date parsing failed"
- **Cause**: Unexpected date format in statement
- **Solution**: Contact support with statement format details

#### "Amount parsing error"
- **Cause**: Unusual amount formatting in statement
- **Solution**: Check for special characters or formatting in amount columns

### File Requirements

#### PDF Files
- Must be text-based PDF (not scanned images)
- Should contain structured transaction data
- File size limit: 10MB

#### CSV Files
- Must have proper headers in first row
- Use comma separation
- UTF-8 encoding recommended

#### Excel Files
- .xlsx or .xls format
- Headers should be in first 10 rows
- Data should start immediately after headers

## API Endpoints

### Upload Statement
```http
POST /api/statements/upload
Content-Type: multipart/form-data

Parameters:
- file: MultipartFile (required)
- statementType: "KOTAK_BANK" (required)
```

### Get Supported Statement Types
```http
GET /api/statements/statement-types

Response:
[
  {
    "value": "KOTAK_BANK",
    "label": "Kotak Mahindra Bank", 
    "description": "Kotak Bank account statements with comprehensive parsing",
    "supported": true,
    "supportedFormats": ["PDF", "CSV", "Excel"]
  }
]
```

### Import Transactions
```http
POST /api/statements/import
Content-Type: application/json

Body:
{
  "transactions": [...],
  "skipDuplicates": true,
  "updateDatesToCurrentMonth": false
}
```

## Testing

### Test with Sample Data
1. **Use the included test files** in the project directory
2. **Create sample CSV** with Kotak Bank format headers
3. **Test error scenarios** with malformed files
4. **Verify duplicate detection** by importing same file twice

### Validation Checklist
- ✅ PDF statement parsing works correctly
- ✅ CSV export parsing handles all columns
- ✅ Excel file parsing detects headers properly
- ✅ Transaction categorization is accurate
- ✅ Duplicate detection prevents re-imports
- ✅ Error messages are helpful and actionable
- ✅ UI shows proper statement type selection
- ✅ Progress indication works during upload/parsing

## Technical Implementation

### Backend Components
- `StatementParsingService`: Enhanced with Kotak Bank parsing methods
- `StatementController`: New endpoint for statement types
- `ParsedTransaction`: DTO with confidence and source format tracking

### Frontend Components  
- `StatementUpload.js`: Enhanced with Kotak Bank selection and visual improvements
- Statement type selection with icons and format indicators
- Improved error handling and user feedback

### Security & Performance
- File size validation (10MB limit)
- MIME type checking
- JWT authentication required
- Comprehensive error logging
- Transaction confidence scoring

## Future Enhancements

### Planned Features
- **More Banks**: HDFC, ICICI, SBI statement support
- **QR Code Parsing**: UPI QR code transaction extraction  
- **OCR Support**: Scanned PDF statement parsing
- **Bulk Upload**: Multiple statement files at once
- **Smart Categorization**: Machine learning-based category suggestions

### Integration Options
- **Bank APIs**: Direct integration with Kotak Bank APIs
- **Account Aggregation**: Services like Yodlee, Finicity
- **Real-time Sync**: Automatic transaction fetching

## Support

For issues or questions:
1. Check the error messages and troubleshooting guide above
2. Verify your statement file format matches supported types
3. Contact technical support with sample files (with sensitive data removed)

---

**Last Updated**: August 2025
**Version**: 1.0.0
**Supported Banks**: PhonePe (UPI), Kotak Mahindra Bank