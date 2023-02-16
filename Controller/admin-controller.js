const adminModel=require('../model/admin')
const bcrypt=require('bcrypt')
const userModel=require('../model/user');
const categoryModel = require('../model/category');
const productModel=require('../model/product');
const category = require('../model/category');
const couponModel=require('../model/coupon')
const bannerModel=require('../model/banner')
const orderModel=require('../model/order')


let loggedIn = false ;
let adminloginErr;
let categoryErr;
module.exports={
  
        getAdminLogin:(req,res)=>{
            res.render('Admin/adminlogin',{adminloginErr})
            
        },

        getAdminHome:(req,res)=>{
          res.render('Admin/adminHome')
        },

        getdashboardDetails:async(req,res)=>{
           
            let result1 = {
                cancelledOrders : "0",
                completedOrders : "0",
                pendingOrders : "0"
            }
            const cancelledOrders = await orderModel.aggregate(
                [
    
                    {$match : {"paymentStatus" : 'Cancelled'}  },
    
                    {$count : 'totalcount' }
                ]
            )
            
    
            const completedOrders = await orderModel.aggregate(
                [
    
                    {$match : {"paymentStatus" : "Delivered"}},
    
                    {$count : 'totalcount' }
                ]
            )
    
            const pendingOrders = await orderModel.aggregate(
                [
    
                    {$match : {$or :[
                    {"paymentStatus" : "Pending"},
                    {"paymentStatus" : "Placed"},
                    {"paymentStatus" : "Shipped"}]}},
    
                    {$count : 'totalcount' }
                ]
            )
            if(cancelledOrders.length===0){
                result1.cancelledOrders = [{totalcount : 0}]
            }else{
                result1.cancelledOrders = cancelledOrders
            }
            if(completedOrders.length===0){
                result1.completedOrders = [{totalcount : 0}]
            }else{
                result1.completedOrders = completedOrders
            }
            if(pendingOrders.length===0){
                result1.pendingOrders = [{totalcount : 0}]
            }else{
                result1.pendingOrders = pendingOrders
            }
            res.json(result1)
            console.log(result1)
        },

        getdashboardBar :async(req,res)=>{
            let result = {
                users : '0',
                Profit : '0',
                totalSales : '0'
            }
    
            const users = await userModel.aggregate(
                [
                    {$count : 'totalcount'}
                ]
            
            )
    
            const profit = await orderModel.aggregate(
                [
                    {$match : {$or :[
                        {"paymentStatus" : "Pending"},
                        {"paymentStatus" : "Placed"},
                        {"paymentStatus" : "Shipped"},
                        {"paymentStatus" : "Delivered"}]}},
                    
                ]
            )
    
            const dates = await orderModel.aggregate(
                [
                    {$group : 
                    {_id : "$Date",
                    totalPrice : {
                        "$sum" : "$totalPrice"
                }
                },
                     
            },
    
                    {$sort : {_id : -1}}
                ]
            ).limit(4)
            dates.reverse()
            
            let   totalSales = 0
    
            for(let i=0;i<profit.length;i++){
                totalSales = profit[i].totalPrice + totalSales
            }
    
            let Profit = (totalSales*12)/100
    
            result.users = users
            result.totalSales = totalSales
            result.Profit = Profit
            result.dates = dates

            
    
            res.json(result)
            console.log(result)
        },



        // // getAdminHome:(req,res) => {
        // //     if(loggedIn){
        // //         res.render('Admin/adminHome')  
        // //     }else{
        // //         res.render('/admin')
        // //     }
            
        // },
        PostAdminlogin :async (req,res) => {
            let Admin = await adminModel.findOne({Name:req.body.name})
            if(Admin){
                if(Admin.Password===req.body.Password){
                    loggedIn = true
                    req.session.admin = Admin
                    res.redirect('/Admin/adminHome')
                }else{
                    adminloginErr = "Invalid Email or Password"
                    res.redirect('/admin')
                }           
            }else{
                adminloginErr = "Invalid Email or Password"
                res.redirect('/admin')
            }
        },

        // getAdminusers:(req,res)=>{
        // res.render('Admin/adminuser')
             
        // },

        getAllusers:async (req,res)=>{
           userModel.find({},(err,result)=>{
               if(err){
                res.send(err)
               }else{
                res.render('Admin/adminuser',{result})
               }
           })
        },

        getuserblock: async(req,res)=>{
           let userId=req.params.id

           await userModel.updateOne({_id:userId},{
            $set:{
                userStatus :"block"
            }
           })
           res.json({status:true})
        },
        getuserUnblock:async(req,res)=>{
          console.log(req.params.id)
          let userId=req.params.id;
          await userModel.updateOne({_id:userId},{
            $set:{
                userStatus:"active"
            }
          })
          res.redirect('/Admin/adminusers')
        },
        getAdmincategory:(req,res)=>{
           res.render('Admin/admincategory')
        
        },

        getAllcategory:async (req,res)=>{
        categoryModel.find({},function(err,result){
           if(err){
              res.send('err')
           }else{
            res.render('Admin/admincategory',{result,categoryErr})
            categoryErr=null;
           }
        })
    },

    postAddcategory:(req,res)=>{
        categoryModel.find({category:req.body.category},(err,data)=>{
            if(data.length===0){
                const category = new categoryModel({
                    category:req.body.category
                })
                category.save()
                .then(result=>{
                    res.redirect('Admin/admincategory')
                })
                .catch(err=>{
                    console.log(err);
                })
            }else{
                categoryErr = "Category already added"
                res.redirect('/Admin/admincategory')
            }
        }
        )

    },

    getcategoryproduct:(req,res)=>{
         let categoryname=req.params.category;
         productModel.find({category:categoryname},async(err,result)=>{
           if(err){
            console.log(err);
           }else{
            res.render('Admin/adminproduct',{result})
           }
           
         })
    },

    getAdminproduct:(req,res)=>{
        productModel.find({},(err,result)=>{
            if(err){
                console.log(err)
            }else{
                res.render('Admin/adminproduct',{result})
            }
        })

    },
    getAddproduct:(req,res)=>{
        categoryModel.find({},function(err,result){
            if(err){
                console.log('err')
            }else{
                res.render('Admin/addProduct',{result})
            }
        })

    },
    getDeleteCategory:async (req,res)=>{
        let Category = req.params.category
        productModel.find({category:Category},async(err,data)=>{
            if(data.length!==0){
                res.json({status:false})
            }else{
                await categoryModel.deleteOne({category:Category})
                res.json({status:true})
            }
        })
    },
    postAddProduct:(req,res)=>{
        console.log(req.body);
        console.log(req.files)
        const imagename = []
        for(file of req.files){
            imagename.push(file.filename)
        }
        const product = new productModel({
            productname:req.body.productname,
            category:req.body.category,
            description:req.body.description,
            quantity:req.body.quantity,
            price:req.body.price,
            productImg:imagename,
            productStatus:"true"
        })
        product.save()
        res.redirect('/Admin/adminproduct')
    },

    getEditproduct:(req,res)=>{
        console.log(req.params.id);
        productModel.find({_id:req.params.id},function(err,result){
            if(err){
                console.log('err')
            }else{
                res.render('Admin/editproduct',{result})
            }
        })
    },

       postEditProduct:(req,res)=>{
        const imagename = []
        for(file of req.files){
            imagename.push(file.filename)
        }
        productModel.find({_id:req.params.id},async(err,data)=>{
            if(data.length!==0){
                await productModel.updateOne({_id:req.params.id},{
                    $set:{
                        productname:req.body.productname,
                        category:req.body.category,
                        description:req.body.description,
                        quantity:req.body.quantity,
                        price:req.body.price,
                        productImg:imagename
                    }
                })
                res.redirect('/Admin/adminproduct')
            }else{
                console.log(err)
            }
        })
       } ,
       getSoftDeleteProduct:async (req,res)=>{
        let productId = req.params.id
        await productModel.updateOne({_id:productId},{
            $set:{
                productStatus:"false"
            }
        })
        res.json({status:true})
       },
        
       getUndoSoftDeleteProduct:async (req,res)=>{
        let productId = req.params.id
        await productModel.updateOne({_id:productId},{
            $set:{
                productStatus:"true"
            }
        })
        res.redirect('/Admin/adminproduct')
       },

    //    getdeleteProduct:async(req,res)=>{
    //        let productId=req.params.id
    //        await productModel.deleteOne({_id:productId}) 
    //        res.json({status:true})
    //    },
        getAdminlogout:(req,res)=>{
            req.session.destroy();
            loggedIn = false;
            res.redirect('/Admin')
        } ,

         getAddCuopon :(req,res)=>{
            res.render('Admin/addcoupon')
     },

        postaddcuopon:  (req,res) => {
            couponModel.find({CouponCode:req.body.CouponCode},(err,data)=>{
                if(data.length===0){
                    const coupon = new couponModel ({
                        CouponName:req.body.CuoponName,
                        CouponCode:req.body.CouponCode,
                        Percentage:req.body. Percentage,
                        Minamount:req.body.MinAmuont,
                        Maxamount:req.body. MaxAmount,
                        ExpiryDate:req.body.Date
                    })
                    coupon.save()
                    
                    .then(result=>{
                        res.redirect('/Admin/addcoupon')
                    })
                    .catch(err=>{
                        console.log(err)
                    })
                }else{
                    req.session.couponErr = "Coupon already added"
                    res.redirect('/Admin/addcoupon')
                }
            })
        },
         getcouponlist :(req,res)=>{
         couponModel.find({},(err,result)=>{
                  if(err){
                      console.log(err)
                  }else{
                      res.render('Admin/admincoupon',{result})
                  }
              })
          },

          geteditcoupon:(req,res)=>{
           
            couponModel.find({_id:req.params.id},(err,result)=>{
    
                if(err){
                    console.log(err)
                }else{
                    res.render('Admin/editcoupon',{result})
                }
            })
      },
          editcoupon:(req,res)=>{
            couponModel.find({_id:req.params.id},async(err,data)=>{
                if(data!==0){
                    await couponModel.updateOne({_id:req.params.id},{
                        $set:{
                            CouponName:req.body.CouponName,
                            CouponCode:req.body.CouponCode,
                            Percentage:req.body.Percentage,
                            Minamount:req.body.MinAmuont,
                            Maxamount:req.body.MaxAmount,
                            ExpiryDate:req.body.Date
                        }
                    })
                    res.redirect('/Admin/admincoupon')
                }else{
                    console.log(err);
                }
            })
          },
          getdeletecoupon:async(req,res)=>{
            console.log('hello');
            let couponId=req.params.id
            await couponModel.deleteOne({_id:couponId})
            res.json({status:true})
          },
          getAddbanner:(req,res)=>{
            res.render('Admin/addbanner',{result:false})
          },
          postAddbanner:async(req,res)=>{
              try {
               
                if (req.body) {
                
                  
                   if (req.files) {
                 
                    console.log("=========");
                  let imagename =[]
                    for(file of req.files){
                        imagename.push(file.filename)
                    }
                      if (imagename) {
                       const data = req.body
                        data.bannerimage = imagename
                        const bannerData = new bannerModel(data)
                        console.log(bannerData);
                         await bannerData.save()
                          console.log(bannerData);
                         res.redirect('/Admin/addbanner')
                      } else {
                         //   console.log("pleace add image");
                      }
                   } else {
                      // console.log("pleace add image");
                   }
                } else {
                   res.redirect('/Admin/adminerror')
                }
             } catch (error) {
                console.log(error);
                res.redirect('/Admin/adminerror')
             }
          },

          getAdminbannerList:async(req,res)=>{
             try{
                let bannerlist=await bannerModel.find()
                if(bannerlist){
                    res.render('Admin/bannerlist',{bannerlist})
                }else{
                    res.redirect('/Admin/adminerror')
                }
             }catch(error){
                res.redirect('/Admin/adminerror')
             }
          },

          getAdmineditbanner:async(req,res)=>{
              try {
                const _id = req.params?.id
                const success = await dataCheck(_id, products)
                if (success) {
                   const bannerData = await banner.findOne({ _id })
                   if (bannerData) {
                      res.render('Admin/editbanner', { bannerData })
                   }
                } else {
                   res.redirect('/admin/adminerror')
                }
             } catch (error) {
                res.redirect('/admin/adminerror')
             }
            }
          ,

          getOrders:(req,res)=>{
           
            let orderId = req.params.id
            orderModel.find({_id:orderId},(err,result)=>{
            if(err){
                console.log(err)
            }else{
                res.render('Admin/vieworders',{result})
            }
           })
        }
          ,
       
          getplacedOrders:async(req,res)=>{
            let orderId = req.params.id
            console.log(orderId,'===========orderId=========');
            await orderModel.updateOne({_id:orderId},{
                $set:{
                    paymentStatus : "Placed"
                }
            })
            res.redirect(`/Admin/vieworder/${orderId}`)
        },

        getshippedOrders:async(req,res)=>{
            let orderId = req.params.id
            console.log(orderId,'===========orderId=========');
            await orderModel.updateOne({_id:orderId},{
                $set:{
                    paymentStatus : "Shipped"
                }
            })
            res.redirect("/Admin/vieworder/"+orderId)
        },

        getdeliveredOrders:async(req,res)=>{
            let orderId = req.params.id
            await orderModel.updateOne({_id:orderId},{
                $set:{
                    paymentStatus : "Delivered"
                }
            })
            res.redirect(`/Admin/vieworder/${orderId}`)
        },
        getcancelledOrders:async(req,res)=>{
            let orderId = req.params.id
            await orderModel.updateOne({_id:orderId},{
                $set:{
                    paymentStatus : "Cancelled"
                }
            })
            
            res.redirect(`/Admin/vieworder/${orderId}`)
          
        },

        getadminorders:(req,res)=>{
            orderModel.find({},(err,result)=>{
                if(err){
                    console.log(err)
                }else{
                    res.render('Admin/adminorders',{result})
                }
            })
        },
        getAdminSales:async(req,res)=>{
            orderModel.find({},(err,result)=>{
                if(err){
                    console.log(err)
                }else{
                    res.render('Admin/adminsales',{result})
                }
            })
             
        },
        getAdminHome:(req,res)=>{
            res.render('Admin/adminHome')
        },
        getAdminerror:(req,res)=>{
            res.render('Admin/adminerror')
        },
        // getSoftDeleteBanner:async(req,res)=>{
        //     let bannerId = req.params.id
        //     await bannerModel.updateOne({_id:bannerId},{
        //         $set:{
        //             bannerStatus:"false"
        //         }
        //     })
        //     res.json({status:true})
        // },
        getUndoSoftDeleteBanner:async(req,res)=>{
            let bannerId = req.params.id
            await bannerModel.deleteOne({_id:bannerId})
            res.redirect('/Admin/adminbannerlist')
        },
                  

        getAdmineditbanner:async(req,res)=>{
            try {
                const _id = req.params?.id
              
                   const bannerData = await bannerModel.findOne({ _id })
                   if (bannerData) {
                 
                      res.render('Admin/editbanner', { bannerData })
                   }
              
             } catch (error) {
                res.redirect('/Admin/adminerror')
             }
         } ,

         

        postEditbanner:async(req,res)=>{
            try {
                const _id = req.params.id
                   const Data = req.body
                   const image = req.file
                   if (image) {
                      Data.bannerimage = image.filename
                   }
                   await bannerModel.updateOne({_id},{
                    $set:Data
                })
                   res.redirect('/Admin/adminbannerlist')
              
             } catch (error) {
                res.redirect('/Admin/adminerror')
             }
        }
     

    }


   
