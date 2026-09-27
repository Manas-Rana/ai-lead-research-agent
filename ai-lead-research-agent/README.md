# AI Lead Research & Outreach Agent

An assignment-ready full-stack AI application that researches a company, evaluates it against a configurable Ideal Customer Profile (ICP), and drafts personalised outreach for human review.

## Project 1 — AI Lead Research and Outreach Agent

### Core features

- Accept a company name or website URL
- Research the company using OpenAI web search
- Extract company overview, industry, size signal, likely pain points and buying signals
- Score the lead from 1–10 against a simple ICP
- Generate a personalised cold email
- Generate a concise LinkedIn message
- Show evidence/source links
- Provide a human review step: edit, regenerate, approve
- Persist research runs in SQLite
- Validate inputs with Zod
- Structured AI output to reduce malformed responses
- Server-side API key handling
- Request logging and error handling
- Demo/fallback mode when `OPENAI_API_KEY` is not configured
- CSV batch processing is included as a lightweight stretch feature

## Architecture

```text
                           ┌──────────────────────────┐
                           │       React + Vite       │
                           │      Review Dashboard    │
                           └────────────┬─────────────┘
                                        │ HTTP
                                        ▼
                           ┌──────────────────────────┐
                           │      Node.js / Express    │
                           │        REST API           │
                           └────────────┬─────────────┘
                                        │
             ┌──────────────────────────┼──────────────────────────┐
             │                          │                          │
             ▼                          ▼                          ▼
     ┌────────────────┐       ┌────────────────┐       ┌────────────────┐
     │ Research       │       │ Lead Scoring   │       │ Outreach       │
     │ Service        │       │ Service        │       │ Service        │
     └───────┬────────┘       └───────┬────────┘       └───────┬────────┘
             │                        │                        │
             └────────────────────────┼────────────────────────┘
                                      ▼
                           ┌──────────────────────────┐
                           │       OpenAI API          │
                           │ Responses + Web Search    │
                           │ Structured Outputs        │
                           └──────────────────────────┘
                                      │
                                      ▼
                           ┌──────────────────────────┐
                           │        SQLite DB          │
                           │      Research History     │
                           └──────────────────────────┘
```

## Tech stack

- Frontend: React, Vite, CSS
- Backend: Node.js, Express
- AI: OpenAI JavaScript SDK + Responses API
- Validation: Zod
- Database: SQLite with better-sqlite3
- Security: Helmet, CORS, rate limiting
- Logging: Pino + pino-http
- CSV: csv-parse
- Runtime: Node.js 20+

## Prerequisites

- Node.js 20 or newer
- npm
- An OpenAI API key for live AI research

## Setup

### 1. Clone

```bash
git clone https://github.com/YOUR_USERNAME/ai-lead-research-agent.git
cd ai-lead-research-agent
```

### 2. Install all dependencies

```bash
npm run install:all
```

### 3. Configure the server

```bash
cd server
cp .env.example .env
```

On Windows PowerShell, if `cp` is unavailable:

```powershell
Copy-Item .env.example .env
```

Open `server/.env` and set:

```env
OPENAI_API_KEY=your_key_here
OPENAI_MODEL=gpt-4o-mini
PORT=5000
CLIENT_ORIGIN=http://localhost:5173
DATABASE_PATH=./data/leads.db
```

### 4. Run development mode

From the project root:

```bash
npm run dev
```

Open:

```text
http://localhost:5173
```

Backend health check:

```text
http://localhost:5000/api/health
```

## Demo mode

If `OPENAI_API_KEY` is missing, the app automatically uses deterministic demo data.

This is useful for:

- UI development
- Recording a local walkthrough
- Testing the approval/edit workflow
- Demonstrating error handling

Live research requires an OpenAI API key.

## API

### Health

```http
GET /api/health
```

### Research a company

```http
POST /api/leads/research
Content-Type: application/json

{
  "company": "https://stripe.com"
}
```

### List saved research

```http
GET /api/leads
```

### Get one research run

```http
GET /api/leads/:id
```

### Update review

```http
PATCH /api/leads/:id/review
Content-Type: application/json

{
  "status": "approved",
  "emailBody": "Edited message...",
  "linkedinMessage": "Edited LinkedIn message..."
}
```

### Regenerate outreach

```http
POST /api/leads/:id/regenerate
```

## ICP scoring model

The default ICP is intentionally simple and explainable:

- Industry fit: 0–2
- Company-size signal: 0–2
- Pain-point fit: 0–2
- Buying signal: 0–2
- Technology/automation fit: 0–2

Total: **1–10**

The application does not treat the score as a fact. It is an AI-assisted sales prioritisation signal that should be reviewed by a human.

## Hallucination controls

1. Research is grounded in web-search results.
2. Structured Outputs constrain the AI response shape.
3. The prompt instructs the model to mark unavailable information as unknown instead of inventing it.
4. Evidence/source URLs are displayed.
5. Human approval is required before outreach is considered approved.
6. Input and response validation is performed server-side.
7. The UI labels the score as an AI recommendation, not a guaranteed truth.

## Error handling

- Invalid input → 400 response
- Rate limit → 429 response
- OpenAI failure → 502 response
- Unexpected server failure → 500 response
- Request logging includes request ID
- Frontend shows recoverable error messages
- Demo mode provides a local fallback when no API key is configured

## CSV batch processing

A sample CSV is provided at:

```text
data/sample-leads.csv
```

The format is:

```csv
company
stripe.com
notion.so
```

The main UI supports one company at a time for the clearest human-review workflow. The CSV is included as a stretch-goal foundation and can be extended into a queue/worker workflow.

## Production improvements

With more time I would:

- Add authentication and user accounts
- Move SQLite to PostgreSQL
- Add a background job queue for batch research
- Add CRM integrations such as HubSpot
- Add email delivery through a provider such as Resend/SendGrid
- Add persistent audit logs
- Add automated evaluation datasets for score and outreach quality
- Add observability dashboards
- Add deployment with separate frontend/backend services
- Add automated CI tests

## Demo video script

Target duration: 3–5 minutes.

### 0:00–0:30 — Problem

"Sales teams spend time researching companies before writing personalised outreach. This application automates the research and drafting part while keeping a human in control."

### 0:30–1:15 — Input

Enter a company URL such as:

```text
https://stripe.com
```

Explain that the server validates the input and starts the research workflow.

### 1:15–2:15 — Research

Show:

- Company overview
- Industry
- Size signal
- Pain points
- Buying signals
- Sources

Explain that the AI uses web search and structured output.

### 2:15–3:00 — Scoring

Show the 1–10 score and factor breakdown.

Explain:

"The score is an explainable prioritisation signal based on the project's ICP. It is not an automatic sales decision."

### 3:00–4:00 — Outreach

Show:

- Personalised email
- LinkedIn message

Edit one sentence and click Approve.

### 4:00–4:30 — Reliability

Show the saved research history and explain validation, error handling, source grounding and human approval.

### 4:30–5:00 — Architecture

Briefly show the architecture diagram and explain React → Express → AI services → SQLite.

## Submission checklist

- [ ] GitHub repository is public or shared with reviewer
- [ ] README is present
- [ ] `.env` is not committed
- [ ] Demo video is 3–5 minutes
- [ ] Architecture diagram is included
- [ ] Live link added if deployed
- [ ] Project tested locally
- [ ] Sample input works
- [ ] Human approval workflow demonstrated

## License

MIT
