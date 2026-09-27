# Architecture Diagram

```text
┌───────────────────────────────────────────────────────────────────────┐
│                            React + Vite                               │
│                                                                       │
│  Company Input → Research View → ICP Score → Outreach → Human Review │
└───────────────────────────────┬───────────────────────────────────────┘
                                │ REST / JSON
                                ▼
┌───────────────────────────────────────────────────────────────────────┐
│                         Node.js + Express                             │
│                                                                       │
│  Validation → Controller → Research Service → Database                │
└───────────────┬───────────────────────────────┬───────────────────────┘
                │                               │
                ▼                               ▼
      ┌──────────────────────┐       ┌──────────────────────────────┐
      │      OpenAI API      │       │        SQLite Database       │
      │                      │       │                              │
      │ Responses API        │       │ research_runs                │
      │ Web Search           │       │ result JSON                   │
      │ Structured Outputs   │       │ status + timestamps           │
      └──────────────────────┘       └──────────────────────────────┘
```

## Request flow

1. User submits a company name or URL.
2. Express validates the request with Zod.
3. Research service normalises the company input.
4. OpenAI Responses API performs web research.
5. Structured output returns a predictable lead-research object.
6. The backend validates the returned object again.
7. The result is saved to SQLite.
8. React renders research, evidence, score and outreach.
9. The user edits or regenerates the outreach.
10. The user explicitly approves or rejects the draft.

## Design decisions

### Why Node.js?

The application is JavaScript end-to-end, making it easy to share conventions between frontend and backend. Node's async I/O is also suitable for API-heavy workflows.

### Why structured output?

The AI result is consumed by application code, so predictable fields are more useful than free-form text. Structured Outputs constrain the response to a defined schema.

### Why human review?

The application generates sales content but does not automatically send it. This reduces the risk of an inaccurate or inappropriate AI-generated message reaching a prospect.

### Why SQLite?

SQLite keeps local setup simple and is sufficient for an assessment/demo. PostgreSQL would be the natural production upgrade.

### Why evidence?

The score and outreach are only as reliable as the research. Showing sources gives the reviewer a way to verify important claims.
