const express=require('express')
const storageImg = require('../multer/multer')
const adminRouter=require('../Controller/admin-controller')
const router=express.Router()
const bannerImg=require('../multer/addbanner-multer')
const adminSession = require('../middleware/auth')



router.get('/', adminRouter.getAdminLogin)

router.get('/adminhome',adminSession.adminSession, adminRouter.getAdminHome)

router.get('/getdashboarddetails',adminSession.adminSession,adminRouter.getdashboardDetails)

router.get('/dashboardBar',adminSession.adminSession,adminRouter.getdashboardBar)

router.post('/adminlogin',adminRouter.PostAdminlogin)

router.get('/adminlogut',adminRouter.getAdminlogout)

// router.get('/adminusers',adminRouter.getAdminusers)
router.get('/adminusers',adminSession.adminSession,adminRouter.getAllusers)

router.get('/userblock/:id',adminRouter.getuserblock)

router.get('/userUnblock/:id',adminRouter.getuserUnblock)

// router.get('/admincategory',adminRouter.getAdmincategory)
router.get('/admincategory',adminSession.adminSession,adminRouter.getAllcategory)

router.post ('/addcategory',adminSession.adminSession,adminRouter.postAddcategory)

router.get('/adminproduct',adminSession.adminSession,adminRouter.getAdminproduct)

router.get('/addproduct', adminSession.adminSession, adminRouter.getAddproduct)

router.post('/addproduct',storageImg.array("productImg",3),adminRouter.postAddProduct)

router.get('/categoryproduct/:category',adminSession.adminSession,adminRouter.getcategoryproduct)

router.get('/deletecategory/:category',adminRouter.getDeleteCategory)

router.get('/editproduct/:id',adminSession.adminSession,adminRouter.getEditproduct)

router.post('/editproduct/:id',storageImg.array("productImg",2),adminRouter.postEditProduct)

router.get('/softdeleteproduct/:id',adminSession.adminSession,adminRouter.getSoftDeleteProduct)

router.get('/undosoftdeleteproduct/:id',adminSession.adminSession,adminRouter.getUndoSoftDeleteProduct)

// router.get('/deleteproduct/:id',adminRouter.getdeleteProduct)

  router.get('/addcoupon',adminSession.adminSession,adminRouter .getAddCuopon)

  router.post('/addpostcuopon',adminRouter.postaddcuopon)

 router.get('/admincoupon',adminSession.adminSession,adminRouter.getcouponlist)

 router.get('/editcoupon/:id',adminSession.adminSession,adminRouter.geteditcoupon)

 router.post('/editcoupon/:id',adminRouter.editcoupon)

 router.get('/deletecoupon/:id',adminSession.adminSession,adminRouter.getdeletecoupon)

 router.get('/addbanner',adminSession.adminSession,adminRouter.getAddbanner)
 
 router.post('/addbanner',storageImg.array("bannerImg",3),adminRouter.postAddbanner)

  
 router.post('/editbanner/:id',storageImg.array("bannerImg",3),adminRouter.postEditbanner)

 router .get('/vieworder/:id',adminRouter.getOrders)

 router.get('/placeOrder/:id',adminRouter.getplacedOrders)

router.get('/shippedOrder/:id',adminRouter.getshippedOrders)

router.get('/cancelledOrder/:id',adminRouter.getcancelledOrders)

router.get('/deliveredOrder/:id',adminRouter.getdeliveredOrders)

router.get('/adminorders',adminSession.adminSession,adminRouter.getadminorders)

 router.get('/adminsales',adminSession.adminSession,adminRouter.getAdminSales)

  router.get('/adminhome',adminSession.adminSession,adminRouter.getAdminHome)

 router.get('/adminbannerlist',adminSession.adminSession,adminRouter.getAdminbannerList)
 
 router.get('/adminerror',adminSession.adminSession,adminRouter.getAdminerror)

 router.get('/editbanner/:id',adminSession.adminSession, adminRouter.getAdmineditbanner)

 router.get('/undosoftdeletebanner/:id',adminRouter.getUndoSoftDeleteBanner)

 router.use(function (req, res, next) {
  next(createError(404));
})

router.use(function (err, req, res, next) {
  res.status(err.status || 404);
  res.render('Admin/adminerror');
})

module.exports=router;