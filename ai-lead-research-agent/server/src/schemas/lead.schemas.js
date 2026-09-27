import { z } from "zod";

export const researchRequestSchema = z.object({
  company: z.string().trim().min(2).max(300)
});

export const reviewSchema = z.object({
  status: z.enum(["draft", "approved", "rejected"]).default("draft"),
  emailBody: z.string().max(10000).optional(),
  linkedinMessage: z.string().max(3000).optional()
});

export const researchOutputSchema = z.object({
  companyName: z.string(),
  website: z.string(),
  overview: z.string(),
  industry: z.string(),
  companySizeSignal: z.string(),
  headquartersSignal: z.string(),
  productsOrServices: z.array(z.string()),
  likelyPainPoints: z.array(z.string()),
  buyingSignals: z.array(z.string()),
  evidence: z.array(z.object({
    claim: z.string(),
    source: z.string()
  })),
  icpScore: z.number().int().min(1).max(10),
  scoreBreakdown: z.object({
    industryFit: z.number().int().min(0).max(2),
    companySizeFit: z.number().int().min(0).max(2),
    painPointFit: z.number().int().min(0).max(2),
    buyingSignal: z.number().int().min(0).max(2),
    technologyFit: z.number().int().min(0).max(2)
  }),
  scoreReason: z.string(),
  outreach: z.object({
    subject: z.string(),
    emailBody: z.string(),
    linkedinMessage: z.string()
  }),
  reviewNotes: z.array(z.string())
});

export const demoResult = {
  companyName: "Example Technologies",
  website: "https://example.com",
  overview: "A sample B2B technology company used for local demonstration mode.",
  industry: "B2B Technology",
  companySizeSignal: "Unknown — demo data",
  headquartersSignal: "Unknown — demo data",
  productsOrServices: ["Business software", "Digital services"],
  likelyPainPoints: [
    "Manual lead qualification",
    "Sales follow-up consistency",
    "Scaling outbound research"
  ],
  buyingSignals: [
    "Growing digital presence",
    "Potential need for sales process automation"
  ],
  evidence: [
    {
      claim: "Demo mode is active; no external company research was performed.",
      source: "local-demo"
    }
  ],
  icpScore: 8,
  scoreBreakdown: {
    industryFit: 2,
    companySizeFit: 1,
    painPointFit: 2,
    buyingSignal: 1,
    technologyFit: 2
  },
  scoreReason: "Strong illustrative fit for the sample ICP, but the score must be reviewed against real company evidence.",
  outreach: {
    subject: "A practical idea for improving lead research at Example Technologies",
    emailBody: "Hi there,\\n\\nI came across Example Technologies and noticed the kind of B2B workflow where sales teams can benefit from faster lead research and consistent follow-up.\\n\\nWe help teams reduce manual research and turn qualified prospects into personalised outreach faster. If improving that workflow is on your roadmap, I’d be happy to share a short example.\\n\\nBest,\\nYour Name",
    linkedinMessage: "Hi! I came across Example Technologies and thought your sales workflow could be a good fit for faster AI-assisted lead research. Happy to share a quick example if useful."
  },
  reviewNotes: [
    "Demo mode: replace illustrative facts with live research before sending outreach."
  ]
};
