import { Router } from "express";
import { createAnItem, getAllItems } from "../controllers/itemsControllers.js";
import multer from "multer";

const router = Router();

// GET all items
router.get("/", getAllItems);


//Multer setup
const storage = multer.diskStorage({
    destination: (req,file, cb) => {
        cb(null, 'uploads/items');
    },
    filename: (req, file, cb) => {
        const suffix = Date.now();
        cb(null, suffix + '-' + file.originalname);
    }
})

//Multer filter for image files only
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
  limits: { fileSize: 1024 * 1024 * 5 }, //limit each image to 5MB
});

router.post("/", upload.array("itemPhotos", 4), createAnItem);


export default router;