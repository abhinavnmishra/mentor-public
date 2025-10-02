# Clickwrap Agreement System

## Overview

This is a legally robust clickwrap agreement system with immutable audit trails and versioned documents. The system allows coaches to create multi-page agreements that can be accepted by users with full audit tracking.

## Core Features

1. **Multi-page Agreement Creation**: Supports rich text editors with pagination or PDF document uploads
2. **Version Management**: Immutable versioning system with draft/published/retired states
3. **Automatic PDF Generation**: Converts HTML content to PDF with auto-pagination on publish
4. **Immutable Audit Trails**: Complete tracking of all acceptances with metadata
5. **Legal Compliance**: SHA256 document hashing from PDF binary and comprehensive audit logging
6. **Backdating Prevention**: Validates effective dates to prevent invalidating previous acceptances
7. **Auto-Pagination**: Intelligent page breaks for long HTML content in PDF generation

## API Endpoints

### Agreement Management

#### 1. Get All Agreements
```
GET /api/agreements
```
- **Access**: ROLE_ADMIN, ROLE_MODERATOR, ROLE_USER
- **Query Parameters**: 
  - `createdBy` (optional): Filter by creator UUID
- **Response**: List of AgreementResponse objects

#### 2. Get Agreement by ID
```
GET /api/agreements/{agreementId}
```
- **Access**: ROLE_ADMIN, ROLE_MODERATOR, ROLE_USER
- **Response**: AgreementResponse with all versions

#### 3. Create New Agreement
```
POST /api/agreements
```
- **Access**: ROLE_ADMIN, ROLE_MODERATOR, ROLE_USER
- **Body**: CreateAgreementRequest
- **Response**: AgreementResponse with initial draft version

#### 4. Create New Version
```
POST /api/agreements/{agreementId}/versions
```
- **Access**: ROLE_ADMIN, ROLE_MODERATOR, ROLE_USER
- **Body**: CreateVersionRequest
- **Response**: AgreementVersionResponse

#### 5. Update Draft Version
```
PUT /api/agreements/versions/{versionId}
```
- **Access**: ROLE_ADMIN, ROLE_MODERATOR, ROLE_USER
- **Body**: UpdateVersionRequest
- **Response**: AgreementVersionResponse

#### 6. Publish Version
```
POST /api/agreements/versions/{versionId}/publish
```
- **Access**: ROLE_ADMIN, ROLE_MODERATOR, ROLE_USER
- **Body**: PublishVersionRequest
- **Response**: AgreementVersionResponse (immutable)

#### 7. Retire Version
```
POST /api/agreements/versions/{versionId}/retire
```
- **Access**: ROLE_ADMIN, ROLE_MODERATOR, ROLE_USER
- **Response**: AgreementVersionResponse

### Agreement Acceptance

#### 8. Accept Agreement
```
POST /api/agreements/accept
```
- **Access**: ROLE_ADMIN, ROLE_MODERATOR, ROLE_CLIENT, ROLE_USER
- **Body**: AcceptAgreementRequest
- **Response**: AgreementAcceptanceResponse

#### 9. Get User Acceptance History
```
GET /api/agreements/acceptances/user/{userId}
```
- **Access**: ROLE_ADMIN, ROLE_MODERATOR
- **Response**: List of AgreementAcceptanceResponse

#### 10. Get My Acceptance History
```
GET /api/agreements/acceptances/my-history
```
- **Access**: ROLE_ADMIN, ROLE_MODERATOR, ROLE_CLIENT, ROLE_USER
- **Response**: List of AgreementAcceptanceResponse

#### 11. Get Agreement Acceptance History
```
GET /api/agreements/{agreementId}/acceptances
```
- **Access**: ROLE_ADMIN, ROLE_MODERATOR, ROLE_USER
- **Response**: List of AgreementAcceptanceResponse

#### 12. Verify Acceptance (Audit)
```
GET /api/agreements/acceptances/{acceptanceId}/verify
```
- **Access**: ROLE_ADMIN, ROLE_MODERATOR
- **Response**: AgreementAcceptanceResponse with validation

#### 13. Get Acceptance Statistics
```
GET /api/agreements/{agreementId}/statistics
```
- **Access**: ROLE_ADMIN, ROLE_MODERATOR, ROLE_USER
- **Response**: AcceptanceStatistics

### PDF Management

#### 14. Download Agreement PDF
```
GET /api/agreements/versions/{versionId}/pdf
```
- **Access**: ROLE_ADMIN, ROLE_MODERATOR, ROLE_USER, ROLE_CLIENT
- **Response**: PDF file as attachment

#### 15. View Agreement PDF Inline
```
GET /api/agreements/versions/{versionId}/pdf/view
```
- **Access**: ROLE_ADMIN, ROLE_MODERATOR, ROLE_USER, ROLE_CLIENT
- **Response**: PDF file for inline viewing

#### 16. Regenerate PDF (Admin Only)
```
POST /api/agreements/versions/{versionId}/regenerate-pdf
```
- **Access**: ROLE_ADMIN
- **Response**: AgreementVersionResponse with new PDF hash

## Data Models

### Agreement
- **id**: UUID (Primary Key)
- **title**: String (Required, max 255 chars)
- **description**: String (Optional, max 1000 chars)
- **createdBy**: UUID (Creator user ID)
- **createdAt**: LocalDateTime
- **updatedAt**: LocalDateTime
- **versions**: List of AgreementVersion

### AgreementVersion
- **id**: UUID (Primary Key)
- **agreement**: Agreement (Foreign Key)
- **versionNumber**: Integer (Auto-incremented per agreement)
- **status**: AgreementStatus (DRAFT, PUBLISHED, RETIRED)
- **pages**: List of AgreementPage (Rich text content)
- **pdfFilePath**: String (PDF document path for uploads)
- **generatedPdfAssetId**: UUID (Reference to generated PDF in PublicAsset)
- **docSha256**: String (Document hash calculated from PDF binary)
- **publishedAt**: LocalDateTime
- **retiredAt**: LocalDateTime
- **effectiveAt**: LocalDateTime
- **publishedBy**: UUID
- **createdAt**: LocalDateTime

### AgreementAcceptance (Immutable)
- **id**: UUID (Primary Key)
- **userId**: UUID (User who accepted)
- **agreementVersion**: AgreementVersion (Foreign Key)
- **docSha256**: String (Document hash at acceptance time)
- **ipAddress**: String (Client IP)
- **userAgent**: String (Browser/client info)
- **correlationId**: String (For tracing)
- **acceptedAt**: LocalDateTime (Immutable timestamp)
- **sessionId**: String (Session tracking)
- **acceptanceMethod**: String (WEB_FORM, API, etc.)

## Request/Response DTOs

### CreateAgreementRequest
```json
{
  "title": "Terms of Service",
  "description": "Main terms of service agreement"
}
```

### CreateVersionRequest
```json
{
  "pages": [
    {
      "pageNumber": 1,
      "title": "Introduction",
      "content": "<p>Welcome to our service...</p>"
    }
  ],
  "pdfFilePath": "/path/to/document.pdf"
}
```

### PublishVersionRequest
```json
{
  "effectiveAt": "2024-01-01T00:00:00"
}
```

### AcceptAgreementRequest
```json
{
  "agreementVersionId": "uuid-here",
  "userId": "user-uuid-here",
  "sessionId": "session-123"
}
```

## Security Features

1. **Document Integrity**: SHA256 hashing from PDF binary ensures document content hasn't been tampered with
2. **Immutable Records**: Once published, agreement versions and acceptances cannot be modified
3. **PDF Generation**: Automatic conversion to PDF on publish ensures consistent document format
4. **Audit Trail**: Complete logging with correlation IDs for all acceptance flows
5. **IP Tracking**: Records client IP address and user agent for each acceptance
6. **Backdating Prevention**: Validates effective dates to prevent invalidating existing acceptances
7. **Role-Based Access**: Different permission levels for different user types

## Logging and Correlation

The system uses structured logging with correlation IDs for complete traceability:

```
2024-01-01 12:00:00 INFO [correlationId=uuid-123] Agreement acceptance processed for version: uuid-456 by user: uuid-789
```

All acceptance flows are logged with:
- Correlation ID for tracing
- User ID and agreement version
- IP address and user agent
- Document hash verification
- Timestamp and session information

## Usage Examples

### Creating and Publishing an Agreement

1. **Create Agreement**:
   ```bash
   POST /api/agreements
   {
     "title": "Privacy Policy",
     "description": "Company privacy policy"
   }
   ```

2. **Update Draft Version**:
   ```bash
   PUT /api/agreements/versions/{versionId}
   {
     "pages": [
       {
         "pageNumber": 1,
         "title": "Data Collection",
         "content": "<p>We collect the following data...</p>"
       }
     ]
   }
   ```

3. **Publish Version** (generates PDF and calculates hash):
   ```bash
   POST /api/agreements/versions/{versionId}/publish
   {
     "effectiveAt": "2024-01-01T00:00:00"
   }
   ```
   
   *Note: This automatically converts HTML content to PDF with auto-pagination and calculates the SHA256 hash from the PDF binary.*

### User Acceptance Flow

1. **Accept Agreement**:
   ```bash
   POST /api/agreements/accept
   {
     "agreementVersionId": "published-version-uuid",
     "userId": "user-uuid"
   }
   ```

2. **Verify Acceptance**:
   ```bash
   GET /api/agreements/acceptances/{acceptanceId}/verify
   ```

3. **Download PDF**:
   ```bash
   GET /api/agreements/versions/{versionId}/pdf
   ```

## PDF Generation Features

### Auto-Pagination
The system automatically handles pagination for long HTML content:
- **Page Limit**: ~3000 characters per page (configurable)
- **Smart Breaks**: Breaks content at sentence boundaries
- **Styled Output**: Professional PDF formatting with headers, footers, and page numbers
- **Responsive Design**: Optimized for A4 page size

### PDF Content Structure
Generated PDFs include:
- **Document Header**: Title, version number, effective date, published date
- **Paginated Content**: HTML content with automatic page breaks
- **Document Footer**: Document ID, generation timestamp
- **Professional Styling**: Clean, legal-document formatting

### Hash Integrity
- Hash is calculated from the **PDF binary data**, not HTML content
- Ensures the exact PDF that users see and accept is what's hashed
- Prevents any tampering with the document format or content
- Maintains legal integrity for audit purposes

This system provides a complete, legally compliant solution for managing clickwrap agreements with full audit trails, immutable records, and professional PDF generation with auto-pagination.
