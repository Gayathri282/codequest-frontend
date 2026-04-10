const multer = require('multer');
const path   = require('path');
const fs     = require('fs');

const storage = (folder) =>
  multer.diskStorage({
    destination: (_req, _file, cb) => {
      const dir = path.join(__dirname, `../uploads/${folder}`);
      fs.mkdirSync(dir, { recursive: true });
      cb(null, dir);
    },
    filename: (_req, file, cb) => {
      const ext  = path.extname(file.originalname);
      const name = `${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`;
      cb(null, name);
    },
  });

const imageFilter = (_req, file, cb) => {
  if (file.mimetype.startsWith('image/')) cb(null, true);
  else cb(new Error('Only image files are allowed'), false);
};

const limits5  = { fileSize: 5  * 1024 * 1024 };
const limits10 = { fileSize: 10 * 1024 * 1024 };

exports.productUpload  = multer({ storage: storage('products'),   fileFilter: imageFilter, limits: limits5  });
exports.idUpload       = multer({ storage: storage('id_proofs'),  fileFilter: imageFilter, limits: limits5  });

// Categories: single image or replace image
exports.categoryUpload = multer({ storage: storage('categories'), fileFilter: imageFilter, limits: limits5  });

// Banners: accepts both `image` (desktop) and `image_mobile` fields
exports.bannerUpload = multer({ storage: storage('banners'), fileFilter: imageFilter, limits: limits10 });
