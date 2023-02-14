const mongoose = require('mongoose')
const { array } = require('../multer/multer')
const Schema = mongoose.Schema

const banner = new Schema({
    Heading:{
        type:String,
        required:true
    },
    offer:{
        type:Number,
        required:true 
    },
    bannerimage:{
        type:Array,
        required:true 
    }
})

module.exports = mongoose.model('banner',banner)