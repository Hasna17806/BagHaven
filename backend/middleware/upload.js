import multer from "multer";
import path from "path";

// Storage config
const storage = multer.diskStorage({
  destination(req, file, cb) {
    cb(null, "uploads/");
  },
  filename(req, file, cb) {
  
    cb(
      null,
      `image-${Date.now()}${path.extname(file.originalname)}`
    );
  },
});

// File type check
function fileFilter(req, file, cb) {
  const filetypes = /jpeg|jpg|png|webp|avif|gif/i;
  const extname = filetypes.test(
    path.extname(file.originalname).toLowerCase()
  );
  const mimetype = filetypes.test(file.mimetype);

  if (extname && mimetype) {
    cb(null, true);
  } else {
    cb(new Error("Only images (jpeg, jpg, png, webp, avif, gif) are allowed!"), false);
  }
}

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, 
    files: 5
  }
});

export default upload;