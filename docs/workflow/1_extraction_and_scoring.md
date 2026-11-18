# Workflow 1 — Resume Parsing & ATS Scoring

This document describes how raw resume PDFs are parsed and analyzed programmatically.

---

## 1. Sandboxed PDF Parsing Workflow

To bypass class inheritance issues and prototype overrides in Next.js development environment VMs, PDF parsing runs in an isolated child process:

```
[Client Upload File] 
        │
        ▼
[Next.js Server API: /api/resume/parse]
        │
        ▼ (Write raw buffer to temp file)
[src/lib/temp_xyz.pdf]
        │
        ▼ (Launch clean subprocess)
[Child Process CLI: node src/lib/pdfCliParser.js]
        │
        ▼ (Execute native pdf-parse)
[Extract UTF-8 Text Stream]
        │
        ▼ (Pipe standard output)
[Parse rawText & Delete Temp File]
```

### File Locations:
*   Subprocess wrapper: [resumeParser.ts](file:///Users/harshsingh/Desktop/ai%20resume%20/resumeiq-ai/src/lib/resumeParser.ts)
*   Isolated Node CLI: [pdfCliParser.js](file:///Users/harshsingh/Desktop/ai%20resume%20/resumeiq-ai/src/lib/pdfCliParser.js)

---

## 2. Deterministic ATS Scoring Matrix

The overall score is a weighted value out of **100 points**, computed using direct string matches, section boundary scans, and quantitative regex patterns:

```
  ┌─────────────────────────────────────────────────────────────┐
  │                   ATS Score (100 Points Max)                │
  └──────────────────────────────┬──────────────────────────────┘
                                 │
         ┌───────────────────────┼───────────────────────┐
         ▼                       ▼                       ▼
   Keyword Match           Technical Skills      Section Presence
    (30 Points)              (20 Points)            (10 Points)
         │                       │                       │
         ├───────────────────────┼───────────────────────┤
         ▼                       ▼                       ▼
   Formatting Layout       Action Verb Count      Metric Ratios
    (10 Points)              (15 Points)            (15 Points)
```

### Breakdown of Weights:
1.  **Keyword Matching (30 points)**: Computes the density of target keywords matching the job description:
    $$\text{Score} = \text{Min}\left(30, \frac{\text{Matched Keywords}}{\text{Total Job Keywords}} \times 30\right)$$
2.  **Technical Skills (20 points)**: Calculates the ratio of target skills mapped in the resume's skills tags.
3.  **Action Verbs (15 points)**: Evaluates the number of active keywords (e.g. *Built, Delivered, Managed*) inside experience bullet points. Resumes with fewer than 5 active verbs are penalized.
4.  **Quantified Achievements (15 points)**: Searches bullet points for digits, percentages, or dollar amounts to verify that accomplishments are backed by quantitative results.
5.  **Section Coverage (10 points)**: Verifies the presence of key sections (Summary, Experience, Projects, Education, Skills).
6.  **Formatting Compatibility (10 points)**: Analyzes readability, check for excessively nested components, or blank line anomalies that confuse legacy parser algorithms.

### Code Location:
*   Local Analysis Module: [analyze.ts](file:///Users/harshsingh/Desktop/ai%20resume%20/resumeiq-ai/src/lib/analyze.ts)
