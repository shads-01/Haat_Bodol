import { Router } from "express";
import Item from "../models/Item.js";
import { createAnItem, getAllItems } from "../controllers/itemsControllers.js";

const router = Router();

// POST An item
router.post("/", createAnItem);

// GET all items
router.get("/", getAllItems);

export default router;