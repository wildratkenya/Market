import { Router } from "express";
import multer from "multer";
import path from "path";
import fs from "fs";
import { requireEditor } from "../middleware/admin-auth";
import { logger } from "../lib/logger";

const router = Router();

// Safely resolve upload directory relative to current working directory
const uploadDir = path.resolve(process.cwd(), "public/images");
if (!fs.existsSync(uploadDir)) {
  try {
    fs.mkdirSync(uploadDir, { recursive: true });
  } catch (err) {
    logger.error({ err, uploadDir }, "Failed to create upload directory");
  }
}

// Configure multer storage
const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, uploadDir);
  },
  filename: (_req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname);
    cb(null, `book-${uniqueSuffix}${ext}`);
  },
});

const upload = multer({ 
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: (_req, file, cb) => {
    if (file.mimetype.startsWith("image/")) {
      cb(null, true);
    } else {
      cb(new Error("Only images are allowed"));
    }
  }
});

router.post("/upload", requireEditor, upload.single("image"), (req, res) => {
  try {
    if (!req.file) {
      res.status(400).json({ error: "No file uploaded" });
      return;
    }
    
    // Return the URL path
    const fileUrl = `/images/${req.file.filename}`;
    res.json({ url: fileUrl });
  } catch (err) {
    logger.error({ err }, "Upload error");
    res.status(500).json({ error: "Upload failed" });
  }
});

export default router;
