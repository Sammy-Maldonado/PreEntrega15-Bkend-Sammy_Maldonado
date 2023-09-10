import multer from "multer";
import __dirname from "../utils.js"

//¿Donde voy a almacenar TODO?

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    let folder;

    if (file.fieldname === "profileImage") {
      folder = "profiles";
    } else if (file.fieldname === "thumbnails") {
      folder = "products";
    } else if (file.fieldname === "document") {
      folder = "documents";
    } else {
      folder = "uploads"; // Carpeta predeterminada para otros tipos de archivos
    }

    cb(null, `${__dirname}/public/${folder}`);
  },
  filename: function (req, file, cb) {
    cb(null, `${Date.now()}-${file.originalname}`);
  },
});

const uploader = multer({ storage });

export default uploader;