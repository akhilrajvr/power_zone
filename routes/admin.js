const express=require('express')
const storageImg = require('../multer/multer')
const adminRouter=require('../Controller/admin-controller')
const router=express.Router()
const bannerImg=require('../multer/addbanner-multer')
const adminsession = require('../middleware/auth')



router.get('/',adminRouter.getAdminLogin)

router.get('/adminhome', adminsession.adminSession,adminRouter.getAdminHome)

router.get('/getdashboarddetails',adminRouter.getdashboardDetails)

router.get('/dashboardBar',adminRouter.getdashboardBar)

router.post('/adminlogin',adminRouter.PostAdminlogin)

router.get('/adminlogut',adminRouter.getAdminlogout)

// router.get('/adminusers',adminRouter.getAdminusers)
router.get('/adminusers',adminRouter.getAllusers)

router.get('/userblock/:id',adminRouter.getuserblock)

router.get('/userUnblock/:id',adminRouter.getuserUnblock)

// router.get('/admincategory',adminRouter.getAdmincategory)
router.get('/admincategory',adminRouter.getAllcategory)

router.post ('/addcategory',adminRouter.postAddcategory)

router.get('/adminproduct', adminsession.adminSession,adminRouter.getAdminproduct)

router.get('/addproduct', adminsession.adminSession,adminRouter.getAddproduct)

router.post('/addproduct',storageImg.array("productImg",3),adminRouter.postAddProduct)

router.get('/categoryproduct/:category',adminsession.adminSession,adminRouter.getcategoryproduct)

router.get('/deletecategory/:category',adminsession.adminSession,adminRouter.getDeleteCategory)

router.get('/editproduct/:id',adminRouter.getEditproduct)

router.post('/editproduct/:id',storageImg.array("productImg",2),adminRouter.postEditProduct)

router.get('/softdeleteproduct/:id',adminRouter.getSoftDeleteProduct)

router.get('/undosoftdeleteproduct/:id',adminRouter.getUndoSoftDeleteProduct)

// router.get('/deleteproduct/:id',adminRouter.getdeleteProduct)

  router.get('/addcoupon',adminsession.adminSession,adminRouter .getAddCuopon)

  router.post('/addpostcuopon',adminRouter.postaddcuopon)

 router.get('/admincoupon',adminRouter.getcouponlist)

 router.get('/editcoupon/:id',adminRouter.geteditcoupon)

 router.post('/editcoupon/:id',adminRouter.editcoupon)

 router.get('/deletecoupon/:id',adminRouter.getdeletecoupon)

 router.get('/addbanner',adminsession.adminSession,adminRouter.getAddbanner)
 
 router.post('/addbanner',bannerImg.array("bannerimage",2),adminRouter.postAddbanner)
  
 router.post('/editbanner/:id',bannerImg.array("bannerimage",2),adminRouter.postEditbanner)

 router .get('/vieworder/:id',adminsession.adminSession,adminRouter.getOrders)

 router.get('/placeOrder/:id',adminRouter.getplacedOrders)

router.get('/shippedOrder/:id',adminRouter.getshippedOrders)

router.get('/cancelledOrder/:id',adminRouter.getcancelledOrders)

router.get('/deliveredOrder/:id',adminRouter.getdeliveredOrders)

router.get('/adminorders',adminsession.adminSession,adminRouter.getadminorders)

 router.get('/adminsales',adminsession.adminSession,adminRouter.getAdminSales)

  router.get('/adminhome',adminRouter.getAdminHome)

 router.get('/adminbannerlist',adminRouter.getAdminbannerList)
 
 router.get('/adminerror',adminRouter.getAdminerror)

 router.get('/editbanner/:id',adminRouter.getAdmineditbanner)

//  router.get('/softdeletebanner/:id',adminRouter.getSoftDeleteBanner)

 router.get('/undosoftdeletebanner/:id',adminRouter.getUndoSoftDeleteBanner)
module.exports=router;