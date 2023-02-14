const mongoose=require('mongoose')
console.log(process.env.MONGOOSE_LINK)
mongoose.connect(process.env.MONGOOSE_LINK,{useNewUrlparser:true});

mongoose.connection
.once('open',()=>console.log('Databse connected'))
.on('error',(error)=>console.log("Error",error))