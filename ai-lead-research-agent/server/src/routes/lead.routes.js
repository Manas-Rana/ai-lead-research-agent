import { Router } from "express";
import {
  research,
  history,
  getOne,
  review,
  regenerate
} from "../controllers/lead.controller.js";

const router = Router();

router.post("/research", research);
router.get("/", history);
router.get("/:id", getOne);
router.patch("/:id/review", review);
router.post("/:id/regenerate", regenerate);

export default router;
