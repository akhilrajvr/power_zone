
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
const bannerImg = multer({storage:storage})
module.exports = bannerImg