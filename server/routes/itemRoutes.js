import { Router } from "express";
import {
  createAnItem,
  getAllItems,
  getItemById,
  searchItems,
} from "../controllers/itemsControllers.js";
import multer from "multer";
import { v2 as cloudinary } from "cloudinary";
import { CloudinaryStorage } from "multer-storage-cloudinary";

const router = Router();

// GET all items
router.get("/", getAllItems);

router.get("/search", searchItems);

//Multer setup
//CloudinaryStorage setup
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: "items",
    allowed_formats: ["jpg", "jpeg", "png", "webp"],
    public_id: (req, file) => {
      const suffix = Date.now();
      return `${suffix}-${file.originalname.split(".")[0]}`;
    },
  },
});

const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith("image/")) {
    cb(null, true);
  } else {
    cb(new Error("Only images are allowed!"), false);
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 1024 * 1024 * 5 },
});

router.post("/", upload.array("itemPhotos", 4), createAnItem);

router.get("/:id", getItemById);

export default router;