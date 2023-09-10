import multer from "multer";
import __dirname from "../utils.js"

//¿Donde voy a almacenar TODO?

const storageProductsImages = multer.diskStorage({
  destination: function(req,file,cb){     //Carpeta donde se van a guardar las imagenes
    cb(null,`${__dirname}/public/products`)
  },
  filename: function(req,file,cb){        //Como se va a guardar el nombre del archivo
    cb(null, `${Date.now()}-${file.originalname}`)
  }
})

const storageProfileImages = multer.diskStorage({
  destination: function(req,file,cb){     //Carpeta donde se van a guardar las imagenes
    cb(null,`${__dirname}/public/products`)
  },
  filename: function(req,file,cb){        //Como se va a guardar el nombre del archivo
    cb(null, `${Date.now()}-${file.originalname}`)
  }
})

const storageDocuments = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, `${__dirname}/public/documents`);    //Aqui se guardan los documents del usuario
  },
  filename: function(req,file,cb){
    cb(null, `${Date.now()}-${file.originalname}`)
  }
});


const uploadPI = multer({storage: storageProductsImages});
const uploadPImg = multer({storage: storageProfileImages});
const uploadDocuments = multer({ storage: storageDocuments });

export {
  uploadPI,
  uploadPImg,
  uploadDocuments
}