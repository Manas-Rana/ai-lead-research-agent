import { researchRequestSchema, reviewSchema } from "../schemas/lead.schemas.js";
import {
  runResearch,
  getHistory,
  getResearch,
  reviewResearch,
  regenerateResearch
} from "../services/lead.service.js";

export async function research(req, res, next) {
  try {
    const { company } = researchRequestSchema.parse(req.body);
    const result = await runResearch(company);
    res.status(201).json(result);
  } catch (error) {
    next(error);
  }
}

export function history(_req, res) {
  res.json({ items: getHistory() });
}

export function getOne(req, res) {
  const result = getResearch(Number(req.params.id));

  if (!result) {
    return res.status(404).json({ error: "Research run not found." });
  }

  return res.json(result);
}

export function review(req, res, next) {
  try {
    const updates = reviewSchema.parse(req.body);
    const result = reviewResearch(Number(req.params.id), updates);

    if (!result) {
      return res.status(404).json({ error: "Research run not found." });
    }

    return res.json(result);
  } catch (error) {
    next(error);
  }
}

export async function regenerate(req, res, next) {
  try {
    const result = await regenerateResearch(Number(req.params.id));

    if (!result) {
      return res.status(404).json({ error: "Research run not found." });
    }

    return res.json(result);
  } catch (error) {
    next(error);
  }
}
