import OpenAI from "openai";
import { zodTextFormat } from "openai/helpers/zod";
import { researchOutputSchema, demoResult } from "../schemas/lead.schemas.js";
import { env } from "../config/env.js";
import { withRetry } from "../utils/retry.js";

const openai = env.OPENAI_API_KEY
  ? new OpenAI({ apiKey: env.OPENAI_API_KEY })
  : null;

function normalizeCompanyInput(input) {
  const trimmed = input.trim();

  if (/^https?:\/\//i.test(trimmed)) {
    return trimmed.replace(/\/+$/, "");
  }

  return `https://${trimmed.replace(/^www\./i, "")}`.replace(/\/+$/, "");
}

function extractAnnotations(response) {
  const sources = [];

  for (const item of response.output ?? []) {
    for (const content of item.content ?? []) {
      for (const annotation of content.annotations ?? []) {
        if (annotation.type === "url_citation" && annotation.url) {
          sources.push({
            url: annotation.url,
            title: annotation.title ?? annotation.url
          });
        }
      }
    }
  }

  return [...new Map(sources.map((source) => [source.url, source])).values()];
}

function buildInput(companyInput, normalizedUrl) {
  return `
Research this company for a B2B sales representative.

Company input: ${companyInput}
Likely website: ${normalizedUrl}

You are a research and outreach assistant. Use web search to verify information.

Important rules:
- Prefer the company's official website and credible public sources.
- Do not invent company size, headquarters, products, customers, revenue, funding, or pain points.
- If a fact cannot be verified, explicitly say "Unknown" or "Not found".
- Separate observable evidence from inference.
- Pain points must be plausible business problems supported by the company's context; label them as likely, not certain.
- The ICP is illustrative: B2B software/technology or digitally enabled businesses that may benefit from sales automation and AI-assisted lead research.
- Score each factor from 0 to 2. The five factor values must sum exactly to the final 1–10 ICP score; if the raw sum is 0, use a final score of 1 and explain the uncertainty.
- Generate outreach using only facts that are supported by the research.
- Never claim that the prospect requested contact.
- Return concise, human-sounding copy suitable for a sales rep.
- The "reviewNotes" field should identify uncertainty or facts a human should verify.
`;
}

export async function researchCompany(companyInput) {
  const normalizedUrl = normalizeCompanyInput(companyInput);

  if (!openai) {
    return {
      result: {
        ...demoResult,
        website: normalizedUrl
      },
      normalizedUrl,
      demoMode: true
    };
  }

  try {
    const response = await withRetry(
      () => openai.responses.parse({
        model: env.OPENAI_MODEL,
        tools: [
          {
            type: "web_search",
            search_context_size: "medium"
          }
        ],
        input: buildInput(companyInput, normalizedUrl),
        text: {
          format: zodTextFormat(researchOutputSchema, "lead_research")
        }
      }),
      { retries: 2 }
    );

    if (!response.output_parsed) {
      const error = new Error("The AI returned no structured result.");
      error.code = "OPENAI_ERROR";
      throw error;
    }

    const parsed = researchOutputSchema.parse(response.output_parsed);
    const sources = extractAnnotations(response);

    const mergedEvidence = [
      ...parsed.evidence,
      ...sources.map((source) => ({
        claim: "Source returned by the web research tool",
        source: source.url
      }))
    ];

    return {
      result: {
        ...parsed,
        evidence: [...new Map(
          mergedEvidence.map((entry) => [`${entry.claim}|${entry.source}`, entry])
        ).values()]
      },
      normalizedUrl,
      demoMode: false
    };
  } catch (error) {
    error.code = "OPENAI_ERROR";
    throw error;
  }
}

export async function regenerateOutreach(currentResult) {
  if (!openai) {
    return currentResult;
  }

  const response = await withRetry(
    () => openai.responses.parse({
      model: env.OPENAI_MODEL,
      input: [{
        role: "user",
        content: [{
          type: "input_text",
          text: `
Rewrite the outreach for this researched company.

Rules:
- Do not add new company facts.
- Use only the supplied research.
- Keep the email concise and natural.
- Make the LinkedIn message under 300 characters.
- Do not use hype, fake familiarity, or unverifiable claims.
- Return only the requested structured fields.

Research:
${JSON.stringify(currentResult)}
`
        }]
      }],
      text: {
        format: zodTextFormat(
          researchOutputSchema.pick({
            outreach: true
          }),
          "outreach"
        )
      }
    }),
    { retries: 2 }
  );

  return {
    ...currentResult,
    outreach: response.output_parsed.outreach
  };
}
