
const mongoose = require('mongoose')

const Schema = mongoose.Schema

let adminSchema = new Schema ({
    Name:{
        type:String,
        required:true
    },
    Password:{
        type:String,
        required:true
    }
}) 

module.exports = mongoose.model('admin',adminSchema)