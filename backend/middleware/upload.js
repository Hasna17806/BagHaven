import multer from "multer";

// Store files in memory (NOT disk)
const storage = multer.memoryStorage();

// File type check
function fileFilter(req, file, cb) {
  const filetypes = /jpeg|jpg|png|webp|avif|gif/i;
  const mimetype = filetypes.test(file.mimetype);

  if (mimetype) {
    cb(null, true);
  } else {
    cb(new Error("Only image files are allowed"), false);
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
