const express=require('express')
const { get } = require('mongoose')
const { unsubscribe } = require('../app')
const { getUndoSoftDeleteProduct } = require('../Controller/admin-controller')
const usercontrollers=require('../Controller/user-controller')
const router=express.Router()

router.get('/',usercontrollers.getUserHome)

router.get('/login',usercontrollers.getUserLogin) 

router.get('/signin',usercontrollers.getUserSingnin)

 router.post('/signup',usercontrollers.postUserSignup)
  
 router.post('/login',usercontrollers.postUserloigin)

 router.get('/logout',usercontrollers.getUserLogout)

 router.get('/otp',usercontrollers.getotp)

 router.post('/otp',usercontrollers.PostOtp)

 router.get('/usercontact',usercontrollers.getContact)

 router.get('/home',usercontrollers.getHome)

 router.get('/shop',usercontrollers.getUserShop)

 router.get('/addtocart/:id',usercontrollers.getuserCart)

 router.get('/cart',usercontrollers.getcart)

 router.get('/productdetails/:id',usercontrollers.getProductdetails)

 router.post('/cartinc/:id',usercontrollers.Postusercartinc)

 router.post('/cartminues/:id',usercontrollers.postuserminues)

 router.get('/checkout/:total',usercontrollers.getcheckout)

 router.post('/placeorder',usercontrollers.postAddaddress)

 router.get('/wishlist',usercontrollers.getwishlist)

 router.get('/wishlist/:id',usercontrollers.getAddtowishlist)

 router.get('/deleteproduct/:id',usercontrollers.getdeletproduct)
  
 router.get('/myprofile', usercontrollers.getUserProfile)

 router.get('/categoryfilter/:data',usercontrollers.categoryfilter)

 router .get('/deleteproductcart/:id',usercontrollers.getdeleteCart)

 router.get('/404',usercontrollers.geterror)

//  router.get('/viewaddress',usercontrollers.getviewAddress)

// router.post('/addaddress',usercontrollers.postAddress)

//  router.get('/placeorder',usercontrollers.getplaceorder)

//  router.post('/checkout/:total',usercontrollers.PostUserCheckout)

 router.post('/checkout/:id',usercontrollers.postCheckout)

 router.post('/verifypayment',usercontrollers.postverifyPayment)

 router.get('/placedOrder',usercontrollers.getPlacedOrder)
 
 router.post('/applycoupon/:id',usercontrollers.postapplyCoupon)

 router.post('/addaddress',usercontrollers.postAddress)

 router.get('/deleteaddress/:id',usercontrollers.getdeleteAddress)

 router.get('/MyOrders',usercontrollers.getMyorders)

 router.get('/cancelorder/:id',usercontrollers.getCancelOrder)



module.exports=router;