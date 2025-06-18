import multer from "multer";
import crypto from "crypto";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";
import { dirname } from "path";

// Setup __dirname for ES Modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Define absolute path to upload folder
const uploadPath = path.join(__dirname, '..', 'public', 'images', 'upload');

// ✅ Ensure directory exists
if (!fs.existsSync(uploadPath)) {
  fs.mkdirSync(uploadPath, { recursive: true });
}

// Configure multer storage
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadPath); // Use the correct absolute path
  },
  filename: function (req, file, cb) {
    crypto.randomBytes(12, (err, raw) => {
      if (err) return cb(err, null);
      const uniqueName = raw.toString('hex') + path.extname(file.originalname);
      cb(null, uniqueName);
    });
  }
});

// Final multer upload object
const upload = multer({ storage });

export default upload;
