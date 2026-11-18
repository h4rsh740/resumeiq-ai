# Workflow 2 — AI Enhancement & Anti-Hallucination Pipeline

This document explains the communication with Google Gemini and the safety controls that filter AI recommendations.

---

## 1. AI Enhancement Flow

To ensure high availability and bypass API limits, ResumeIQ AI runs a dual-layer AI routing pipeline:

```
                  [Assemble prompts & original data]
                                  │
                                  ▼
                     [Call Google Gemini v1beta]
                                  │
                     (Fallback if 429/quota limit)
                                  │
                                  ▼
               [Query OpenRouter: tencent/hy3:free]
                                  │
                                  ▼
                      [Extract JSON Text Block]
                                  │
                                  ▼
                       [Zod Schema Validation]
```

### Prompt Engineering:
*   **System Prompt**: Injects strict boundaries instructing the AI to act as an elite recruiter. It forbids generating fake credentials, changing companies, altering dates, or fabricating metrics.
*   **User Prompt**: Provides a raw dump of the parsed resume, target job details, calculated scores, and specific lists of missing keywords and critical issues.
*   **System Files**:
    *   System Prompt builder: [prompts.ts](file:///Users/harshsingh/Desktop/ai%20resume%20/resumeiq-ai/src/lib/prompts.ts)
    *   Gemini connector: [gemini.ts](file:///Users/harshsingh/Desktop/ai%20resume%20/resumeiq-ai/src/lib/gemini.ts)

---

## 2. Anti-Hallucination & Factual Guardrails

To prevent the model from fabricating unevidenced credentials (which would ruin a candidate's background check), ResumeIQ AI executes a strict, programmatically enforced validation loop:

```
             [Gemini JSON Suggestion List]
                          │
                          ▼
            [Anti-Hallucination Validator]
                          │
         (For each suggested text block change)
                          │
     ┌────────────────────┴────────────────────┐
     ▼                                         ▼
[Check for New Entities]             [Check for Metric Scaling]
(e.g. universities, companies)       (e.g. inventing new % stats)
     │                                         │
     └────────────────────┬────────────────────┘
                          ▼
             {Did it inject new facts?}
              /                      \
             Yes                     No
            /                          \
           ▼                            ▼
  [Violation Logged]          [Change Approved]
  [Revert to Original]        [Apply to Enhanced Data]
```

### Verification Checks:
1.  **Factual Entities**: Scans the suggested summary, experience heading, and education fields. If the AI changes the name of a school, inserts an unearned degree, or adds a company, the change is blocked.
2.  **Date Integrity**: Discards changes that extend work history dates or graduation milestones.
3.  **Metrics Fabrication**: Verifies that new percentage gains, dollar values, or scale dimensions are not introduced out of thin air.

### File Location:
*   Validation engine: [resumeEnhancementValidator.ts](file:///Users/harshsingh/Desktop/ai%20resume%20/resumeiq-ai/src/lib/resumeEnhancementValidator.ts)
