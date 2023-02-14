const mongoose = require('mongoose')

const Schema = mongoose.Schema 

let couponSchema = new Schema({
    couponId : {
        type:String,
        required:true
    },
    CouponName : {
        type:String,
        required:true
    },
    CouponCode : {
        type:String,
        required:true
    },
  
    percentage:{
        type:Number,
        required:true
    },
    Minamount:{
        type:String,
        required:true
    },
    Maxamount:{
        type:String,
        required:true
    },
    ExpiryDate:{
        type:String,
        required:true
    }

}) 

let addressSchema = new Schema({
    Address : {
        type:String,
        required:true
    },
    City:{
        type:String,
        required:true
    },
    Phone:{
        type:String,
        required:true
    },
    Landmark:{
        type:String,
        required:true
    },
    Pincode:{
        type:String,
        required:true
    }
})


let userSchema = new Schema({
    Firstname:{
        type : String,
        required : true
    },
    Lastname:{
        type : String,
        required : true
    },
    email:{
        type : String,
        required : true
    },
    Phone:{
        type :String,
        required : true

   },
    
    password:{
        type : String,
        required : true
    },

 userStatus:{
        type:String,
        required:true
    },
    coupons: [couponSchema],
    Address : [addressSchema]
    
})

module.exports = mongoose.model('user',userSchema)