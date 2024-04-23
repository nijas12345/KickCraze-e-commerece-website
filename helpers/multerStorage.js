const multer = require("multer")
const path = require("path")
const storage = multer.diskStorage({
    destination:function(req,filename,cb){
        cb(null,path.join(__dirname,"../public/productImages"))
    },
    filename:function(req,file,cb){
       const name = Date.now()+"-"+file.originalname;
       cb(null,name)
    }
})

const upload = multer({
    storage: storage,
    limits: { fileSize: 10 * 1024 * 1024 }, 
    fileFilter: (req, file, cb) => {
     
      cb(null, true); 
    }
  });

  module.exports = upload