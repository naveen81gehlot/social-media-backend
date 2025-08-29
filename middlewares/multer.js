// middlewares/multer.js
import multer from 'multer';
import path from 'path';
import fs from 'fs';

const uploadDir = path.join(process.cwd(), 'public', 'uploads'); // absolute path
fs.mkdirSync(uploadDir, { recursive: true }); // folder banaya, agar na ho to

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => {
    const unique = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname || '');
    cb(null, unique + ext);
  },
});

export const upload = multer({ 
  storage,
limits: { fileSize:50 * 1024 * 1024 } // max 50MB
});

