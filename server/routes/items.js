import { Router } from "express";
import { createAnItem, getAllItems } from "../controllers/itemsControllers.js";

const router = Router();

// POST An item
router.post("/", createAnItem);

// GET all items
// router.get("/", getAllItems);

// GET /api/items → fetch all items
router.get("/", getAllItems);

export default router;