import {
  createRun,
  getRun,
  listRuns,
  updateRun
} from "../db/database.js";
import { researchCompany, regenerateOutreach } from "./research.service.js";

export async function runResearch(company) {
  const { result, normalizedUrl, demoMode } = await researchCompany(company);

  const saved = createRun({
    input: company,
    normalizedUrl,
    companyName: result.companyName,
    result,
    status: "review"
  });

  return {
    ...saved,
    demoMode
  };
}

export function getHistory() {
  return listRuns();
}

export function getResearch(id) {
  return getRun(id);
}

export function reviewResearch(id, updates) {
  return updateRun(id, updates);
}

export async function regenerateResearch(id) {
  const existing = getRun(id);

  if (!existing) return null;

  const nextResult = await regenerateOutreach(existing.result);

  return updateRun(id, {
    emailBody: nextResult.outreach.emailBody,
    linkedinMessage: nextResult.outreach.linkedinMessage,
    status: "draft"
  });
}
