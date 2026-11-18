# Workflow 3 — Selectable PDF Generation

This document describes how structured resume and audit report data is converted back into A4 vector PDFs.

---

## 1. Programmable PDF Drawing Pipeline

Instead of using raw screenshots or HTML-to-Image bridges (which produce fuzzy, unselectable text that ATS scanners cannot index), ResumeIQ AI draws coordinates directly on a PDF vector canvas using `pdf-lib`:

```
          [Request PDF Endpoint: /api/resume/pdf]
                             │
                             ▼
              [Create pdf-lib PDFDocument]
                             │
                             ▼
              [Initialize standard Helvetica]
                             │
                             ▼
              [Page Coordinates Grid (x, y)]
             (Standard A4: 595.27 x 841.89 pt)
                             │
                             ▼
           [Calculate Text Wrapping Boundaries]
                             │
                             ▼
              [Iterate & Draw lines using y]
                             │
                             ▼
              [Save Document binary stream]
```

### Layout Elements:
*   **Text Wrapping**: Scans characters dynamically. If a word exceeds the right page margin (545 pt), it wraps to the next line and decrements the `y` coordinate (default line height: 14 pt).
*   **Dynamic Pagination**: Tracks the current drawing coordinate `y`. If `y` falls below 50 pt, it automatically appends a new blank A4 page, resets `y` to 800 pt, draws page headers, and resumes drawing text.
*   **Searchable Vectors**: Generates a clean stream of font metadata. Standard ATS software (Taleo, Workday, etc.) can read and catalog the text directly.

---

## 2. Generated PDF Formats

The system generates two separate documents:
1.  **Professional Resume PDF**: Single-column professional template displaying the candidate's optimized details (contact info, updated summary, keywords, experience, projects, and education).
    *   File Path: `/api/resume/pdf`
2.  **ATS Audit Report PDF**: Comprehensive multi-page analysis detailing the overall scoring gains, matched/missing keywords list, detected issues list, and descriptions of every single AI change applied.
    *   File Path: `/api/resume/report`

### Code Location:
*   Canvas Drawing Module: [pdfGenerator.ts](file:///Users/harshsingh/Desktop/ai%20resume%20/resumeiq-ai/src/lib/pdfGenerator.ts)
