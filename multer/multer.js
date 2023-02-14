
const multer = require('multer')


const storage = multer.diskStorage({
    destination:function(req,file,callback){
        callback(null,'./public/images')
    },
    filename:function(req,file,callback){
        const unique = Date.now()+'.jpg'
        callback(null,unique)
    }
})
const storageImg = multer({storage:storage})
module.exports = storageImg



// const multer = require('multer');


//   module.exports.upload=(path)=> {
//     const storage = multer.diskStorage({
//       destination: function (req, file, cb) {
//         cb(null, `public/${path}`);
//       },
//       filename: function (req, file, cb) {
//         const ext = file.originalname.substring(file.originalname.lastIndexOf('.'))
//         cb(null,file.fieldname+'-'+Date.now()+ext)
//       }
//       })
//       return multer({ storage: storage });
//   }