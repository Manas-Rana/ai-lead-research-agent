# Evaluation Plan

Before client-facing use, evaluate the agent with a fixed test set.

## Test categories

### 1. Valid inputs

- Official company URL
- Company name
- URL with trailing slash
- URL without protocol

### 2. Difficult inputs

- Very small company
- Large enterprise
- Company with little public information
- Company with an ambiguous name
- Invalid URL
- Non-company website

### 3. AI quality checks

For each test case verify:

- Company name is correct
- Industry is supported by evidence
- Unknown facts are not invented
- Pain points are labelled as likely
- Score is within 1–10
- Score breakdown sums to the score logic
- Email does not claim unsupported facts
- LinkedIn message is concise
- Sources are present where available

## Reliability targets

Suggested internal targets:

- 100% schema-valid responses
- 0% invented "known" facts in manually audited samples
- 100% invalid inputs rejected cleanly
- No API key exposed to browser
- No automatic outreach without human approval

These are evaluation goals, not claims about current production performance.
