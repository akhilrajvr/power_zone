const mongoose = require('mongoose')

const Schema = mongoose.Schema

let productSchema = new Schema ({
    productId:{
        type:String,
        required:true
    },
    productname:{
        type:String,
        required:true
    },
    price:{
        type:String,
        required:true
    },
    productImg:{
        type:Array,
        required:true
    },
    quantity:{
        type:Number,
        required:true
    }
    
})

let addressSchema = new Schema ({
    Firstname : {
        type : String,
        required:true
    },
    Lastname : {
        type : String,
        required:true
    },

    Address : {
        type : String,
        required:true
    },
    City : {
        type : String,
        required : true
    },
    Phone : {
        type:String,
        required : true
    },
    Email : {
        type:String,
        required : true
    },
   
    Landmark : {
        type : String,
        required : true
    },
    pincode : {
        type : String,
        required : true
    }
})



let OrderSchema = new Schema ({
    UserId:{
        type:String,
        required:true
    },
    totalPrice:{
        type:Number,
        required:true
    },
    paymentMode : {
      type:String,
      required:true  
    },
    paymentStatus : {
        type : String,
        required : true
    },
    Date : {
        type : String ,
        required : true
    },

    Products:[productSchema],
    Address : [addressSchema]

  
})

module.exports = mongoose.model('Order',OrderSchema)