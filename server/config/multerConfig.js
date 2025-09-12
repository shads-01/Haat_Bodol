import multer from "multer";
import { v2 as cloudinary } from "cloudinary";
import { CloudinaryStorage } from "multer-storage-cloudinary";

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

export { upload };