require('dotenv').config()
const express=require('express')
const path =require('path')
const ejs=require('ejs')
const app=express()
const mongoose=require('./config/connection')
const session=require('express-session')
const nocache=require('nocache')
const userRouter=require('./routes/user')
const adminRouter=require('./routes/admin')

app.use(session({secret:"key",cookie:{maxAge:6000000}}))
app.use(express.urlencoded())
app.use(express.json())
app.use(express.static(path.join(__dirname,'public')))
app.use(nocache())


app.use(function (req, res, next) {
    res.header('Cache-control', "private,no-cache,no-store,must-revalidate")
    next()
})
 
app.set('view engine','ejs')
app.set('views',path.join(__dirname,'views'));

app.use('/',userRouter)
app.use('/Admin',adminRouter)

app.use(function (req, res, next) {
    next(createError(404));
  });
  
app.use(function (err, req, res, next) {
    res.status(err.status || 404);
    res.render('User/error');
  });

app.listen(5000,()=>{
    console.log('server Running');
})
module.exports=app;