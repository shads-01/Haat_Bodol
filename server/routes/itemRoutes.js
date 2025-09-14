import { Router } from "express";
import {
  createAnItem,
  getAllItems,
  getItemById,
  searchItems,
  getUserItems
} from "../controllers/itemsControllers.js";
import { upload } from "../config/multerConfig.js";
import auth from "../middleware/auth.js"

const router = Router();

// GET all items
router.get("/", getAllItems);

router.get("/search", searchItems);

router.get("/user/:userId/items", getUserItems);

router.post("/", auth, upload.array("itemPhotos", 4), createAnItem);

router.get("/:id", getItemById);

export default router;